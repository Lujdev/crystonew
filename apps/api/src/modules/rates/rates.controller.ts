import { Controller, Get, Headers, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
// biome-ignore lint/style/useImportType: runtime token required by NestJS DI
import { DevelopersService } from "../developers/developers.service";
// biome-ignore lint/style/useImportType: runtime token required by NestJS DI
import { RatesService } from "./rates.service";

@ApiTags("rates")
@Controller("v1")
export class RatesController {
  constructor(
    private readonly ratesService: RatesService,
    private readonly developersService: DevelopersService,
  ) {}

  @Get("rates")
  @ApiOperation({ summary: "Current rates from all active providers" })
  async current(
    @Headers("authorization") authorization?: string,
  ): Promise<Array<Record<string, unknown>>> {
    await this.authorize(authorization, "/v1/rates");
    return await this.ratesService.current();
  }

  @Get("history/:pairCode")
  @ApiQuery({ name: "days", required: false, example: 30 })
  async history(
    @Param("pairCode") pairCode: string,
    @Query("days") days?: string,
    @Headers("authorization") authorization?: string,
  ): Promise<Array<Record<string, unknown>>> {
    await this.authorize(authorization, "/v1/history");
    return await this.ratesService.history(pairCode, days ? Number(days) : 30);
  }

  @Get("convert")
  async convert(
    @Query("amount") amount: string,
    @Query("from") from: string,
    @Query("to") to: string,
    @Headers("authorization") authorization?: string,
  ): Promise<Record<string, unknown>> {
    await this.authorize(authorization, "/v1/convert");
    return await this.ratesService.convert(
      Number(amount),
      from.toUpperCase(),
      to.toUpperCase(),
    );
  }

  private async authorize(
    authorization: string | undefined,
    endpoint: string,
  ): Promise<void> {
    await this.developersService.authorize(
      authorization?.replace(/^Bearer\s+/i, ""),
      endpoint,
    );
  }

  @Get("status")
  async status(): Promise<Record<string, unknown>> {
    const rates = await this.ratesService.current();
    return {
      status: rates.length > 0 ? "ok" : "stale",
      sources: rates.length,
      updatedAt: new Date().toISOString(),
    };
  }
}
