import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppDataSource } from "./database/data-source";
import * as entities from "./database/entities";
import { BackupsModule } from "./modules/backups/backups.module";
import { DevelopersModule } from "./modules/developers/developers.module";
import { HealthController } from "./modules/health/health.controller";
import { RatesModule } from "./modules/rates/rates.module";
import { SchedulerService } from "./modules/scheduler/scheduler.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      entities: Object.values(entities),
      migrationsRun: true,
    }),
    RatesModule,
    DevelopersModule,
    BackupsModule,
  ],
  controllers: [HealthController],
  providers: [SchedulerService],
})
export class AppModule {}
