import {
  BcvProvider,
  BinanceP2pProvider,
  ItalcambiosProvider,
} from "./static.providers";

describe("rate providers", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("expose stable provider contracts and quote timestamps", async () => {
    global.fetch = jest.fn(async (input) => {
      const url = String(input);
      if (url.includes("binance.com")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { price: url.includes("BUY") ? "856.000" : "860.000" },
          }),
        };
      }
      if (url.includes("italcambio.com")) {
        return {
          ok: true,
          status: 200,
          text: async () => `
            <p class="small">USD</p>
            <p class="small">Compra: 756.70830000<br />Venta: 764.27540000</p>
          `,
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => `
          <div id="dolar"><strong class="strong-tb">756,70830000</strong></div>
          <div id="euro"><strong class="strong-tb">883,15420000</strong></div>
        `,
      };
    }) as unknown as typeof fetch;

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
    global.fetch = jest.fn(async (input) => {
      const url = String(input);
      if (url.includes("binance.com")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { price: 856 } }),
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => `
          <div id="dolar"><strong>756,70830000</strong></div>
          <div id="euro"><strong>883,15420000</strong></div>
        `,
      };
    }) as unknown as typeof fetch;

    const official = await new BcvProvider().collect();
    const market = await new BinanceP2pProvider().collect();

    expect(official.map((quote) => quote.pairCode)).toContain("USD/VES");
    expect(market[0]?.pairCode).toBe("USDT/VES");
  });

  test("uses the rates published by the BCV instead of a hardcoded value", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => `
        <div id="dolar"><strong class="strong-tb">756,70830000</strong></div>
        <div id="euro"><strong class="strong-tb">883,15420000</strong></div>
      `,
    })) as unknown as typeof fetch;

    const quotes = await new BcvProvider().collect();

    expect(quotes).toMatchObject([
      { pairCode: "USD/VES", buy: 756.7083, sell: 756.7083 },
      { pairCode: "EUR/VES", buy: 883.1542, sell: 883.1542 },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://www.bcv.org.ve/",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test("uses Binance P2P buy and sell quote prices", async () => {
    global.fetch = jest.fn(async (input) => ({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { price: String(String(input).includes("BUY") ? 856 : 860) },
      }),
    })) as unknown as typeof fetch;

    const quotes = await new BinanceP2pProvider().collect();

    expect(quotes).toMatchObject([
      {
        providerCode: "BINANCE_P2P",
        pairCode: "USDT/VES",
        buy: 856,
        sell: 860,
        status: "verified",
      },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://www.binance.com/bapi/c2c/v1/public/c2c/agent/quote-price?fiat=VES&asset=USDT&tradeType=BUY",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://www.binance.com/bapi/c2c/v1/public/c2c/agent/quote-price?fiat=VES&asset=USDT&tradeType=SELL",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test("parses the USD buy and sell rates from Italcambio", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => `
        <p class="small">USD</p>
        <p class="small">Compra: 756.70830000 N.E.M :0.0008<br />Venta: 764.27540000 N.E.M :0.0008</p>
      `,
    })) as unknown as typeof fetch;

    const quotes = await new ItalcambiosProvider().collect();

    expect(quotes).toMatchObject([
      {
        providerCode: "ITALCAMBIOS",
        pairCode: "USD/VES",
        buy: 756.7083,
        sell: 764.2754,
        status: "verified",
      },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://www.italcambio.com/divisas.php",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
