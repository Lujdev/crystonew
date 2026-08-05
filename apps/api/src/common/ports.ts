export type ProviderQuote = {
  providerCode: string;
  pairCode: string;
  buy: number;
  sell?: number;
  status: "verified" | "stale" | "unavailable";
  observedAt: Date;
};

export interface RateProvider {
  readonly code: string;
  collect(): Promise<ProviderQuote[]>;
}

export interface EmailPort {
  sendMagicLink(email: string, url: string): Promise<void>;
}

export interface BackupStorage {
  upload(
    filePath: string,
    metadata: { name: string; checksum: string },
  ): Promise<{ id: string }>;
}
