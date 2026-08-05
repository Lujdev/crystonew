import { Module } from "@nestjs/common";
import { BackupService } from "./backup.service";
import { BackupsController } from "./backups.controller";
import { GoogleDriveStorage } from "./google-drive.storage";

@Module({
  providers: [
    BackupService,
    GoogleDriveStorage,
    { provide: "BackupStorage", useExisting: GoogleDriveStorage },
  ],
  controllers: [BackupsController],
  exports: [BackupService],
})
export class BackupsModule {}
