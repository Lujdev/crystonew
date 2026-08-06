import { UnauthorizedException } from "@nestjs/common";
import type { ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import type { EmailPort } from "../../common/ports";
import type {
  ApiKey,
  ApiKeyUsageDaily,
  ApiPlan,
  Developer,
  MagicLink,
} from "../../database/entities";
import {
  DevelopersService,
  TooManyRequestsException,
} from "./developers.service";

const makeRepository = <T extends ObjectLiteral>(): Repository<T> =>
  ({}) as Repository<T>;

const makeRateLimitQuery = (count: number, latest: MagicLink | null) => {
  const where = jest.fn();
  const andWhere = jest.fn();
  const orderBy = jest.fn();
  const getCount = jest.fn().mockResolvedValue(count);
  const getOne = jest.fn().mockResolvedValue(latest);
  const query = { where, andWhere, orderBy, getCount, getOne };

  where.mockReturnValue(query);
  andWhere.mockReturnValue(query);
  orderBy.mockReturnValue(query);

  return {
    query: query as unknown as SelectQueryBuilder<MagicLink>,
    where,
    andWhere,
    orderBy,
  };
};

describe("DevelopersService magic link rate limit", () => {
  const originalEnv = {
    rateLimit: process.env.MAGIC_LINK_RATE_LIMIT,
    windowMs: process.env.MAGIC_LINK_RATE_WINDOW_MS,
    cooldownMs: process.env.MAGIC_LINK_RATE_COOLDOWN_MS,
  };
  let service: DevelopersService;
  let magicLinkRepo: jest.Mocked<Repository<MagicLink>>;
  let emailPort: jest.Mocked<EmailPort>;

  beforeEach(() => {
    delete process.env.MAGIC_LINK_RATE_LIMIT;
    delete process.env.MAGIC_LINK_RATE_WINDOW_MS;
    delete process.env.MAGIC_LINK_RATE_COOLDOWN_MS;

    magicLinkRepo = {
      create: jest.fn().mockReturnValue({} as MagicLink),
      save: jest.fn().mockResolvedValue({} as MagicLink),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<MagicLink>>;
    emailPort = {
      sendMagicLink: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<EmailPort>;
    service = new DevelopersService(
      makeRepository<ApiKey>(),
      makeRepository<ApiKeyUsageDaily>(),
      makeRepository<ApiPlan>(),
      makeRepository<Developer>(),
      magicLinkRepo,
      emailPort,
    );
  });

  afterEach(() => {
    if (originalEnv.rateLimit === undefined)
      delete process.env.MAGIC_LINK_RATE_LIMIT;
    else process.env.MAGIC_LINK_RATE_LIMIT = originalEnv.rateLimit;
    if (originalEnv.windowMs === undefined)
      delete process.env.MAGIC_LINK_RATE_WINDOW_MS;
    else process.env.MAGIC_LINK_RATE_WINDOW_MS = originalEnv.windowMs;
    if (originalEnv.cooldownMs === undefined)
      delete process.env.MAGIC_LINK_RATE_COOLDOWN_MS;
    else process.env.MAGIC_LINK_RATE_COOLDOWN_MS = originalEnv.cooldownMs;
  });

  const queueRateLimitQueries = (
    count: number,
    latest: MagicLink | null = null,
  ): void => {
    const countQuery = makeRateLimitQuery(count, null);
    const latestQuery = makeRateLimitQuery(0, latest);
    magicLinkRepo.createQueryBuilder
      .mockReturnValueOnce(countQuery.query)
      .mockReturnValueOnce(latestQuery.query);
  };

  test("does not query for an invalid email", async () => {
    await expect(
      service.requestMagicLink("not-an-email"),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(magicLinkRepo.createQueryBuilder).not.toHaveBeenCalled();
    expect(emailPort.sendMagicLink).not.toHaveBeenCalled();
  });

  test("allows the first request for an email", async () => {
    queueRateLimitQueries(0);

    await expect(
      service.requestMagicLink(" User@Example.COM "),
    ).resolves.toEqual(expect.objectContaining({ ok: true }));

    expect(emailPort.sendMagicLink).toHaveBeenCalledWith(
      "user@example.com",
      expect.stringContaining("token="),
    );
  });

  test("blocks a second request during the cooldown", async () => {
    queueRateLimitQueries(0);
    await service.requestMagicLink("user@example.com");

    queueRateLimitQueries(1, {
      created_at: new Date(Date.now() - 30_000),
    } as MagicLink);

    await expect(
      service.requestMagicLink("user@example.com"),
    ).rejects.toBeInstanceOf(TooManyRequestsException);
    expect(magicLinkRepo.save).toHaveBeenCalledTimes(1);
  });

  test("blocks the fourth request after three requests in one hour", async () => {
    process.env.MAGIC_LINK_RATE_LIMIT = "3";
    queueRateLimitQueries(0);
    queueRateLimitQueries(1);
    queueRateLimitQueries(2);

    await service.requestMagicLink("user@example.com");
    await service.requestMagicLink("user@example.com");
    await service.requestMagicLink("user@example.com");

    queueRateLimitQueries(3);
    await expect(
      service.requestMagicLink("user@example.com"),
    ).rejects.toBeInstanceOf(TooManyRequestsException);
    expect(magicLinkRepo.save).toHaveBeenCalledTimes(3);
  });

  test("does not share the counter between different emails", async () => {
    process.env.MAGIC_LINK_RATE_LIMIT = "3";
    queueRateLimitQueries(3);
    await expect(
      service.requestMagicLink("first@example.com"),
    ).rejects.toBeInstanceOf(TooManyRequestsException);

    queueRateLimitQueries(0);
    await expect(
      service.requestMagicLink("second@example.com"),
    ).resolves.toEqual(expect.objectContaining({ ok: true }));
  });
});
