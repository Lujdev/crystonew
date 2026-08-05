import {
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
// NestJS needs the runtime class for constructor metadata and dependency injection.
// biome-ignore lint/style/useImportType: runtime token required by NestJS DI
import { BackupService } from "./backup.service";

@ApiTags("backups")
@Controller("v1/backups")
export class BackupsController {
  constructor(private readonly backupService: BackupService) {}

  @Post()
  @ApiOperation({ summary: "Create and upload a SQLite backup" })
  create(@Headers("x-backup-token") token?: string) {
    if (!token || token !== process.env.BACKUP_ADMIN_TOKEN) {
      throw new UnauthorizedException("Invalid backup token");
    }
    return this.backupService.createSnapshot();
  }
}
