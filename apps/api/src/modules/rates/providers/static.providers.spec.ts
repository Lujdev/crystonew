import {
  BcvProvider,
  BinanceP2pProvider,
  ItalcambiosProvider,
} from "./static.providers";

describe("rate providers", () => {
  test("expose stable provider contracts and quote timestamps", async () => {
    const providers = [
      new BcvProvider(),
      new BinanceP2pProvider(),
      new ItalcambiosProvider(),
    ];

    for (const provider of providers) {
      const quotes = await provider.collect();
      expect(quotes.length).toBeGreaterThan(0);
      expect(
        quotes.every((quote) => quote.providerCode === provider.code),
      ).toBe(true);
      expect(quotes.every((quote) => quote.observedAt instanceof Date)).toBe(
        true,
      );
    }
  });

  test("keeps the market provider pair distinct from the official pair", async () => {
    const official = await new BcvProvider().collect();
    const market = await new BinanceP2pProvider().collect();

    expect(official.map((quote) => quote.pairCode)).toContain("USD/VES");
    expect(market[0]?.pairCode).toBe("USDT/VES");
  });
});
