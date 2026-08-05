import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  CurrencyPair,
  CurrentQuote,
  Provider,
  QuoteHistory,
  SyncRun,
} from "../../database/entities";
import { DevelopersModule } from "../developers/developers.module";
import {
  BcvProvider,
  BinanceP2pProvider,
  ItalcambiosProvider,
} from "./providers/static.providers";
import { RatesController } from "./rates.controller";
import { RatesService } from "./rates.service";

@Module({
  imports: [
    DevelopersModule,
    TypeOrmModule.forFeature([
      CurrentQuote,
      QuoteHistory,
      CurrencyPair,
      Provider,
      SyncRun,
    ]),
  ],
  controllers: [RatesController],
  providers: [
    RatesService,
    BcvProvider,
    BinanceP2pProvider,
    ItalcambiosProvider,
  ],
  exports: [RatesService, BcvProvider, BinanceP2pProvider, ItalcambiosProvider],
})
export class RatesModule {}
