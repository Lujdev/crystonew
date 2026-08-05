import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { RateProvider } from "../../common/ports";
import {
  CurrencyPair,
  CurrentQuote,
  Provider,
  QuoteHistory,
  SyncRun,
} from "../../database/entities";

const SCALE = 100;

@Injectable()
export class RatesService {
  constructor(
    @InjectRepository(CurrentQuote)
    private readonly currentRepo: Repository<CurrentQuote>,
    @InjectRepository(QuoteHistory)
    private readonly historyRepo: Repository<QuoteHistory>,
    @InjectRepository(CurrencyPair)
    private readonly pairRepo: Repository<CurrencyPair>,
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    @InjectRepository(SyncRun) private readonly syncRepo: Repository<SyncRun>,
  ) {}

  async sync(providers: RateProvider[]): Promise<void> {
    const run = await this.syncRepo.save(
      this.syncRepo.create({
        status: "running",
        provider_count: providers.length,
      }),
    );
    let quoteCount = 0;
    try {
      for (const provider of providers) {
        const quotes = await provider.collect();
        for (const quote of quotes) {
          const pair = await this.pairRepo.findOneBy({ code: quote.pairCode });
          const source = await this.providerRepo.findOneBy({
            code: quote.providerCode,
          });
          if (!pair || !source) continue;
          const current = await this.currentRepo.findOneBy({
            provider_id: source.id,
            pair_id: pair.id,
          });
          const entity =
            current ??
            this.currentRepo.create({
              provider_id: source.id,
              pair_id: pair.id,
            });
          entity.buy_scaled = Math.round(quote.buy * SCALE);
          entity.sell_scaled =
            quote.sell === undefined ? null : Math.round(quote.sell * SCALE);
          entity.scale = SCALE;
          entity.status = quote.status;
          entity.observed_at = quote.observedAt;
          await this.currentRepo.save(entity);
          await this.historyRepo.save(
            this.historyRepo.create({
              provider_id: source.id,
              pair_id: pair.id,
              buy_scaled: entity.buy_scaled,
              sell_scaled: entity.sell_scaled,
              scale: SCALE,
              status: quote.status,
              sync_run_id: run.id,
            }),
          );
          quoteCount += 1;
        }
      }
      await this.syncRepo.update(run.id, {
        status: "success",
        quote_count: quoteCount,
        finished_at: new Date(),
      });
    } catch (error) {
      await this.syncRepo.update(run.id, {
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
        finished_at: new Date(),
      });
      throw error;
    }
  }

  async current(): Promise<Array<Record<string, unknown>>> {
    const rows = await this.currentRepo.find({ order: { updated_at: "DESC" } });
    const pairs = await this.pairRepo.find();
    const providers = await this.providerRepo.find();
    return rows.map((row) => ({
      provider:
        providers.find((item) => item.id === row.provider_id)?.code ??
        "UNKNOWN",
      pair: pairs.find((item) => item.id === row.pair_id)?.code ?? "UNKNOWN",
      buy: row.buy_scaled / row.scale,
      sell: row.sell_scaled === null ? null : row.sell_scaled / row.scale,
      status: row.status,
      updatedAt: row.updated_at,
    }));
  }

  async history(
    pairCode: string,
    days = 30,
  ): Promise<Array<Record<string, unknown>>> {
    const pair = await this.pairRepo.findOneBy({
      code: pairCode.toUpperCase(),
    });
    if (!pair) throw new NotFoundException(`Unknown pair: ${pairCode}`);
    const since = new Date(Date.now() - days * 86_400_000);
    const rows = await this.historyRepo
      .createQueryBuilder("history")
      .where("history.pair_id = :pairId", { pairId: pair.id })
      .andWhere("history.recorded_at >= :since", { since })
      .orderBy("history.recorded_at", "ASC")
      .getMany();
    return rows.map((row) => ({
      buy: row.buy_scaled / row.scale,
      sell: row.sell_scaled === null ? null : row.sell_scaled / row.scale,
      status: row.status,
      recordedAt: row.recorded_at,
    }));
  }

  async convert(
    amount: number,
    from: string,
    to: string,
  ): Promise<Record<string, unknown>> {
    if (!Number.isFinite(amount) || amount <= 0)
      throw new NotFoundException("amount must be greater than zero");
    if (from === to) return { amount, from, to, result: amount, rate: 1 };
    const rates = await this.current();
    const direct = rates.find((rate) => rate.pair === `${from}/VES`);
    const reverse = rates.find((rate) => rate.pair === `${to}/VES`);
    if (to === "VES" && direct)
      return {
        amount,
        from,
        to,
        result: amount * Number(direct.buy),
        rate: direct.buy,
      };
    if (from === "VES" && reverse)
      return {
        amount,
        from,
        to,
        result: amount / Number(reverse.buy),
        rate: reverse.buy,
      };
    if (direct && reverse) {
      const rate = Number(direct.buy) / Number(reverse.buy);
      return { amount, from, to, result: amount * rate, rate };
    }
    throw new NotFoundException("No conversion rate available");
  }
}
