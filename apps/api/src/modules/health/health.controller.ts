import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller()
export class HealthController {
  @Get("health")
  health(): Record<string, string> {
    return {
      status: "ok",
      service: "crystodolar-api",
      timestamp: new Date().toISOString(),
    };
  }
}
