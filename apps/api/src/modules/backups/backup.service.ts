import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Inject, Injectable, Logger } from "@nestjs/common";
import Database from "better-sqlite3";
import type { BackupStorage } from "../../common/ports";

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @Inject("BackupStorage") private readonly storage: BackupStorage,
  ) {}

  async createSnapshot(): Promise<{
    filePath: string;
    checksum: string;
    sizeBytes: number;
    remoteId: string;
  }> {
    const databasePath = process.env.DATABASE_PATH ?? "data/crystodolar.sqlite";
    const outputDir = join(dirname(databasePath), "..", "backups");
    await mkdir(outputDir, { recursive: true });
    const filePath = join(
      outputDir,
      `crystodolar-${new Date().toISOString().replaceAll(":", "-")}.sqlite`,
    );
    const db = new Database(databasePath, { readonly: true });
    await db.backup(filePath);
    db.close();
    const checksum = await this.sha256(filePath);
    const sizeBytes = (await stat(filePath)).size;
    const remote = await this.storage.upload(filePath, {
      name: filePath.split(/[\\/]/).pop() ?? "crystodolar.sqlite",
      checksum,
    });
    this.logger.log(`Backup created: ${filePath} (${sizeBytes} bytes)`);
    return { filePath, checksum, sizeBytes, remoteId: remote.id };
  }

  private sha256(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const digest = createHash("sha256");
      createReadStream(filePath)
        .on("data", (chunk) => digest.update(chunk))
        .on("end", () => resolve(digest.digest("hex")))
        .on("error", reject);
    });
  }
}
