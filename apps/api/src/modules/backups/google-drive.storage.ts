import { readFile } from "node:fs/promises";
import { Injectable, Logger } from "@nestjs/common";
import type { BackupStorage } from "../../common/ports";

type GoogleTokenResponse = { access_token?: string };
type GoogleFileResponse = { id?: string };

@Injectable()
export class GoogleDriveStorage implements BackupStorage {
  private readonly logger = new Logger(GoogleDriveStorage.name);

  async upload(
    filePath: string,
    metadata: { name: string; checksum: string },
  ): Promise<{ id: string }> {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientId || !clientSecret || !refreshToken || !folderId) {
      this.logger.warn(
        "Google Drive no está configurado; el respaldo queda guardado localmente.",
      );
      return { id: "local-only" };
    }

    const accessToken = await this.refreshAccessToken(
      clientId,
      clientSecret,
      refreshToken,
    );
    const content = await readFile(filePath);
    const boundary = `crystodolar-${Date.now()}`;
    const driveMetadata = JSON.stringify({
      name: metadata.name,
      description: `CrystoDolar SQLite backup; sha256=${metadata.checksum}`,
      mimeType: "application/x-sqlite3",
      parents: [folderId],
    });
    const body = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${driveMetadata}\r\n`,
      ),
      Buffer.from(
        `--${boundary}\r\nContent-Type: application/x-sqlite3\r\n\r\n`,
      ),
      content,
      Buffer.from(`\r\n--${boundary}--`),
    ]);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );
    if (!response.ok) {
      throw new Error(`Google Drive upload failed (${response.status})`);
    }
    const result = (await response.json()) as GoogleFileResponse;
    if (!result.id) {
      throw new Error("Google Drive returned no file id");
    }
    this.logger.log(`Backup uploaded to Google Drive: ${result.id}`);
    return { id: result.id };
  }

  private async refreshAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string,
  ): Promise<string> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!response.ok) {
      throw new Error(`Google OAuth refresh failed (${response.status})`);
    }
    const result = (await response.json()) as GoogleTokenResponse;
    if (!result.access_token) {
      throw new Error("Google OAuth returned no access token");
    }
    return result.access_token;
  }
}
