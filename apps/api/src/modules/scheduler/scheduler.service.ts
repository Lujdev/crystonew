import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
// biome-ignore lint/style/useImportType: runtime tokens required by NestJS DI
import {
  BcvProvider,
  BinanceP2pProvider,
  ItalcambiosProvider,
} from "../rates/providers/static.providers";
// biome-ignore lint/style/useImportType: runtime token required by NestJS DI
import { RatesService } from "../rates/rates.service";

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
    await this.sync();
    const minutes = Number(process.env.SYNC_INTERVAL_MINUTES ?? 30);
    setInterval(() => void this.sync(), minutes * 60_000);
  }

  private async sync(): Promise<void> {
    try {
      await this.ratesService.sync([this.bcv, this.binance, this.italcambios]);
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : String(error));
    }
  }
}
