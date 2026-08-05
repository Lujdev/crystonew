import { Body, Controller, Get, Headers, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
// biome-ignore lint/style/useImportType: runtime token required by NestJS DI
import { DevelopersService } from "./developers.service";

@ApiTags("developers")
@Controller("v1/developers")
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Post("magic-link")
  @ApiOperation({
    summary: "Request an email magic link for API key registration",
  })
  requestMagicLink(
    @Body("email") email: string,
    @Body("plan") plan?: string,
  ): Promise<{ ok: true; previewUrl?: string }> {
    return this.developersService.requestMagicLink(email, plan);
  }

  @Get("verify")
  @ApiOperation({ summary: "Consume a magic link and create a free API key" })
  verify(
    @Query("token") token: string,
  ): Promise<{ apiKey: string; plan: string; monthlyLimit: number }> {
    return this.developersService.consumeMagicLink(token);
  }

  @Get("me")
  async usage(
    @Headers("authorization") authorization?: string,
  ): Promise<Record<string, unknown>> {
    await this.developersService.authorize(
      authorization?.replace(/^Bearer\s+/i, ""),
      "/v1/developers/me",
    );
    return { message: "Authenticated developer endpoint", plan: "free" };
  }
}
