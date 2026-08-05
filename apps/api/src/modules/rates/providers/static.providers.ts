import type { ProviderQuote, RateProvider } from "../../../common/ports";

const now = (): Date => new Date();

export class BcvProvider implements RateProvider {
  readonly code = "BCV";
  async collect(): Promise<ProviderQuote[]> {
    return [
      {
        providerCode: this.code,
        pairCode: "USD/VES",
        buy: 744.23,
        sell: 744.23,
        status: "verified",
        observedAt: now(),
      },
      {
        providerCode: this.code,
        pairCode: "EUR/VES",
        buy: 846.07,
        sell: 846.07,
        status: "verified",
        observedAt: now(),
      },
    ];
  }
}

export class BinanceP2pProvider implements RateProvider {
  readonly code = "BINANCE_P2P";
  async collect(): Promise<ProviderQuote[]> {
    return [
      {
        providerCode: this.code,
        pairCode: "USDT/VES",
        buy: 845.99,
        sell: 850.25,
        status: "verified",
        observedAt: now(),
      },
    ];
  }
}

export class ItalcambiosProvider implements RateProvider {
  readonly code = "ITALCAMBIOS";
  async collect(): Promise<ProviderQuote[]> {
    return [
      {
        providerCode: this.code,
        pairCode: "USD/VES",
        buy: 842.1,
        sell: 847.4,
        status: "verified",
        observedAt: now(),
      },
    ];
  }
}
