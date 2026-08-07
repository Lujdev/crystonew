import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import type { RateProvider } from "../../common/ports";
// biome-ignore lint/style/useImportType: runtime tokens required by NestJS DI
import {
  BcvProvider,
  BinanceP2pProvider,
  ItalcambiosProvider,
} from "../rates/providers/static.providers";
// biome-ignore lint/style/useImportType: runtime token required by NestJS DI
import { RatesService } from "../rates/rates.service";

const DEFAULT_BCV_INTERVAL_MINUTES = 6 * 60;
const DEFAULT_MARKET_INTERVAL_MINUTES = 60;

const positiveMinutes = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  constructor(
    private readonly ratesService: RatesService,
    private readonly bcv: BcvProvider,
    private readonly binance: BinanceP2pProvider,
    private readonly italcambios: ItalcambiosProvider,
  ) {}

  async onModuleInit(): Promise<void> {
    const bcvInterval = positiveMinutes(
      process.env.BCV_SYNC_INTERVAL_MINUTES,
      DEFAULT_BCV_INTERVAL_MINUTES,
    );
    const marketInterval = positiveMinutes(
      process.env.MARKET_SYNC_INTERVAL_MINUTES,
      DEFAULT_MARKET_INTERVAL_MINUTES,
    );

    await this.sync("BCV", [this.bcv]);
    await this.sync("market", [this.binance, this.italcambios]);
    setInterval(() => void this.sync("BCV", [this.bcv]), bcvInterval * 60_000);
    setInterval(
      () => void this.sync("market", [this.binance, this.italcambios]),
      marketInterval * 60_000,
    );
  }

  private syncQueue: Promise<void> = Promise.resolve();

  private sync(label: string, providers: RateProvider[]): Promise<void> {
    const nextSync = this.syncQueue.then(async () => {
      try {
        await this.ratesService.sync(providers);
      } catch (error) {
        this.logger.error(
          `${label} sync failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
    this.syncQueue = nextSync;
    return nextSync;
  }
}
