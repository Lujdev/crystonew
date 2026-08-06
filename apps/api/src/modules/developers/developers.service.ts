import { createHash, randomBytes } from "node:crypto";
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { EmailPort } from "../../common/ports";
import {
  ApiKey,
  ApiKeyUsageDaily,
  ApiPlan,
  Developer,
  MagicLink,
} from "../../database/entities";

const hash = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

const MAGIC_LINK_RATE_LIMIT_DEFAULT = 3;
const MAGIC_LINK_RATE_WINDOW_MS_DEFAULT = 60 * 60 * 1000;
const MAGIC_LINK_RATE_COOLDOWN_MS_DEFAULT = 60 * 1000;
const MAGIC_LINK_RATE_LIMIT_MESSAGE =
  "Too many requests. Please try again later.";

export class TooManyRequestsException extends HttpException {
  constructor(
    response: string | Record<string, unknown> = MAGIC_LINK_RATE_LIMIT_MESSAGE,
  ) {
    super(response, HttpStatus.TOO_MANY_REQUESTS);
  }
}

const readPositiveIntegerEnv = (name: string, fallback: number): number => {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

@Injectable()
export class DevelopersService {
  private readonly logger = new Logger(DevelopersService.name);
  constructor(
    @InjectRepository(ApiKey) private readonly keyRepo: Repository<ApiKey>,
    @InjectRepository(ApiKeyUsageDaily)
    private readonly usageRepo: Repository<ApiKeyUsageDaily>,
    @InjectRepository(ApiPlan) private readonly planRepo: Repository<ApiPlan>,
    @InjectRepository(Developer)
    private readonly developerRepo: Repository<Developer>,
    @InjectRepository(MagicLink)
    private readonly magicLinkRepo: Repository<MagicLink>,
    @Inject("EmailPort") private readonly emailPort: EmailPort,
  ) {}

  async requestMagicLink(
    rawEmail: string,
    requestedPlan = "free",
  ): Promise<{ ok: true; previewUrl?: string }> {
    const email = rawEmail.trim().toLowerCase();
    if (!email.includes("@"))
      throw new UnauthorizedException("Valid email is required");

    const now = new Date();
    const rateLimit = readPositiveIntegerEnv(
      "MAGIC_LINK_RATE_LIMIT",
      MAGIC_LINK_RATE_LIMIT_DEFAULT,
    );
    const windowMs = readPositiveIntegerEnv(
      "MAGIC_LINK_RATE_WINDOW_MS",
      MAGIC_LINK_RATE_WINDOW_MS_DEFAULT,
    );
    const cooldownMs = readPositiveIntegerEnv(
      "MAGIC_LINK_RATE_COOLDOWN_MS",
      MAGIC_LINK_RATE_COOLDOWN_MS_DEFAULT,
    );
    const windowStart = new Date(now.getTime() - windowMs);
    const recentRequestCount = await this.magicLinkRepo
      .createQueryBuilder("magicLink")
      .where("magicLink.email = :email", { email })
      .andWhere("magicLink.created_at >= :windowStart", { windowStart })
      .getCount();
    const latestRequest = await this.magicLinkRepo
      .createQueryBuilder("magicLink")
      .where("magicLink.email = :email", { email })
      .orderBy("magicLink.created_at", "DESC")
      .getOne();

    if (recentRequestCount >= rateLimit)
      throw new TooManyRequestsException(MAGIC_LINK_RATE_LIMIT_MESSAGE);

    const retryAfterMs = latestRequest
      ? latestRequest.created_at.getTime() + cooldownMs - now.getTime()
      : 0;
    if (retryAfterMs > 0)
      throw new TooManyRequestsException({
        message: MAGIC_LINK_RATE_LIMIT_MESSAGE,
        retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      });

    const planCode = requestedPlan === "development" ? "development" : "free";
    const token = randomBytes(32).toString("hex");
    await this.magicLinkRepo.save(
      this.magicLinkRepo.create({
        email,
        plan_code: planCode,
        token_hash: hash(token),
        expires_at: new Date(Date.now() + 15 * 60_000),
      }),
    );
    const url = `${process.env.MAGIC_LINK_BASE_URL ?? "http://localhost:3000/verify"}?token=${token}`;
    await this.emailPort.sendMagicLink(email, url);
    return process.env.NODE_ENV === "production"
      ? { ok: true }
      : { ok: true, previewUrl: url };
  }

  async consumeMagicLink(
    token: string,
  ): Promise<{ apiKey: string; plan: string; monthlyLimit: number }> {
    const link = await this.magicLinkRepo.findOneBy({
      token_hash: hash(token),
    });
    if (!link || link.consumed_at || link.expires_at < new Date())
      throw new UnauthorizedException("Magic link is invalid or expired");
    link.consumed_at = new Date();
    await this.magicLinkRepo.save(link);
    let developer = await this.developerRepo.findOneBy({ email: link.email });
    if (!developer)
      developer = await this.developerRepo.save(
        this.developerRepo.create({ email: link.email }),
      );
    const plan = await this.planRepo.findOneByOrFail({ code: link.plan_code });
    const apiKey = `crys_live_${randomBytes(24).toString("hex")}`;
    await this.keyRepo.save(
      this.keyRepo.create({
        developer_id: developer.id,
        plan_id: plan.id,
        key_prefix: apiKey.slice(0, 16),
        key_hash: hash(apiKey),
      }),
    );
    return { apiKey, plan: plan.code, monthlyLimit: plan.monthly_limit };
  }

  async authorize(rawKey: string | undefined, endpoint: string): Promise<void> {
    if (!rawKey) return;
    const apiKey = await this.keyRepo.findOneBy({ key_hash: hash(rawKey) });
    if (!apiKey?.is_active) throw new UnauthorizedException("Invalid API key");
    const plan = await this.planRepo.findOneByOrFail({ id: apiKey.plan_id });
    const periodStart = new Date();
    const day = periodStart.toISOString().slice(0, 10);
    const usage = await this.usageRepo.findOneBy({
      api_key_id: apiKey.id,
      period_start: day,
    });
    const current =
      usage ??
      this.usageRepo.create({
        api_key_id: apiKey.id,
        period_start: day,
        request_count: 0,
        endpoint_counts_json: "{}",
      });
    const monthStart = `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, "0")}-01`;
    const monthUsage = await this.usageRepo
      .createQueryBuilder("usage")
      .where("usage.api_key_id = :id", { id: apiKey.id })
      .andWhere("usage.period_start >= :start", { start: monthStart })
      .getMany();
    const total = monthUsage.reduce((sum, item) => sum + item.request_count, 0);
    if (total >= plan.monthly_limit)
      throw new UnauthorizedException("Monthly API quota exceeded");
    const counts = JSON.parse(current.endpoint_counts_json ?? "{}") as Record<
      string,
      number
    >;
    counts[endpoint] = (counts[endpoint] ?? 0) + 1;
    current.request_count += 1;
    current.endpoint_counts_json = JSON.stringify(counts);
    await this.usageRepo.save(current);
    await this.keyRepo.update(apiKey.id, { last_used_at: new Date() });
  }

  logMissingProvider(): void {
    this.logger.debug(
      "No Resend key configured; magic links are logged in development.",
    );
  }
}
