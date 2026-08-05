import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ApiKey,
  ApiKeyUsageDaily,
  ApiPlan,
  Developer,
  MagicLink,
} from "../../database/entities";
import { DevelopersController } from "./developers.controller";
import { DevelopersService } from "./developers.service";
import { ResendEmailAdapter } from "./email.adapter";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiKey,
      ApiKeyUsageDaily,
      ApiPlan,
      Developer,
      MagicLink,
    ]),
  ],
  controllers: [DevelopersController],
  providers: [
    DevelopersService,
    ResendEmailAdapter,
    { provide: "EmailPort", useExisting: ResendEmailAdapter },
  ],
  exports: [DevelopersService],
})
export class DevelopersModule {}
