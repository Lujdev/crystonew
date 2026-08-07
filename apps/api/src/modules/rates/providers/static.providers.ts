import * as https from "node:https";
import type { ProviderQuote, RateProvider } from "../../../common/ports";

const now = (): Date => new Date();
const BCV_URL = process.env.BCV_URL ?? "https://www.bcv.org.ve/";
const BINANCE_P2P_URL =
  process.env.BINANCE_P2P_URL ??
  "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
const ITALCAMBIO_URL =
  process.env.ITALCAMBIO_URL ?? "https://www.italcambio.com/divisas.php";
const SOURCE_TIMEOUT_MS = 10_000;
const BCV_TLS_REJECT_UNAUTHORIZED =
  process.env.BCV_TLS_REJECT_UNAUTHORIZED !== "false";

function parseBcvNumber(value: string): number {
  const normalized = value.replace(/\s/g, "");
  const numeric = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;
  const parsed = Number(numeric);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`BCV returned an invalid rate: ${value}`);
  }
  return parsed;
}

function extractBcvRate(html: string, currencyId: "dolar" | "euro"): number {
  const section = html.match(
    new RegExp(
      `id=["']${currencyId}["'][\\s\\S]*?(?=id=["'][^"']+["']|$)`,
      "i",
    ),
  )?.[0];
  const rawRate = section?.match(/<strong[^>]*>([^<]+)<\/strong>/i)?.[1];
  if (!rawRate) throw new Error(`BCV response does not contain ${currencyId}`);
  return parseBcvNumber(rawRate);
}

async function fetchBcvRates(): Promise<{ usd: number; eur: number }> {
  const html = await fetchBcvHtml();
  return {
    usd: extractBcvRate(html, "dolar"),
    eur: extractBcvRate(html, "euro"),
  };
}

async function fetchBcvHtml(): Promise<string> {
  if (!BCV_TLS_REJECT_UNAUTHORIZED) {
    return fetchBcvHtmlWithRelaxedTls();
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  try {
    const response = await fetch(BCV_URL, {
      headers: { Accept: "text/html" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`BCV request failed with HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`BCV request timed out after ${SOURCE_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function fetchBcvHtmlWithRelaxedTls(): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get(
      BCV_URL,
      {
        headers: { Accept: "text/html", "Accept-Encoding": "identity" },
        rejectUnauthorized: false,
      },
      (response) => {
        if (!response.statusCode || response.statusCode >= 400) {
          response.resume();
          reject(
            new Error(
              `BCV request failed with HTTP ${response.statusCode ?? "unknown"}`,
            ),
          );
          return;
        }
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.from(chunk));
        });
        response.on("end", () => {
          resolve(Buffer.concat(chunks).toString("utf8"));
        });
        response.on("error", reject);
      },
    );
    request.setTimeout(SOURCE_TIMEOUT_MS, () => {
      request.destroy(
        new Error(`BCV request timed out after ${SOURCE_TIMEOUT_MS}ms`),
      );
    });
    request.on("error", reject);
  });
}

async function fetchText(url: string, source: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: "text/html" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`${source} request failed with HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `${source} request timed out after ${SOURCE_TIMEOUT_MS}ms`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(
  url: string,
  source: string,
  init: Omit<RequestInit, "signal"> = {},
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.headers as Record<string, string> | undefined),
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`${source} request failed with HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `${source} request timed out after ${SOURCE_TIMEOUT_MS}ms`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseExternalRate(value: unknown, source: string): number {
  const raw = String(value).replace(/\s/g, "");
  const numeric =
    raw.includes(",") && raw.includes(".")
      ? raw.lastIndexOf(",") > raw.lastIndexOf(".")
        ? raw.replace(/\./g, "").replace(",", ".")
        : raw.replace(/,/g, "")
      : raw.replace(",", ".");
  const parsed = Number(numeric);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${source} returned an invalid rate: ${String(value)}`);
  }
  return parsed;
}

interface BinanceP2pAd {
  adv?: {
    price?: unknown;
  };
}

interface BinanceP2pResponse {
  code?: string;
  data?: BinanceP2pAd[];
}

async function fetchBinancePrice(tradeType: "BUY" | "SELL"): Promise<number> {
  const payload = {
    fiat: "VES",
    page: 1,
    rows: 10,
    tradeType,
    asset: "USDT",
    publisherType: "merchant",
    payTypes: ["PagoMovil"],
  };
  const response = (await fetchJson(BINANCE_P2P_URL, "Binance P2P", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })) as BinanceP2pResponse;
  if (response.code !== "000000" || !Array.isArray(response.data)) {
    throw new Error(
      `Binance P2P response does not contain offers for ${tradeType}`,
    );
  }

  const prices = response.data.flatMap((ad) => {
    try {
      return [parseExternalRate(ad.adv?.price, "Binance P2P")];
    } catch {
      return [];
    }
  });
  if (prices.length === 0) {
    throw new Error(
      `Binance P2P response does not contain a valid offer price for ${tradeType}`,
    );
  }
  return Math.max(...prices);
}

function extractItalcambioRates(html: string): { buy: number; sell: number } {
  const usdLabel = /<p[^>]*>\s*USD\s*<\/p>/i.exec(html);
  if (usdLabel?.index === undefined) {
    throw new Error("Italcambio response does not contain USD");
  }
  const usdSection = html.slice(usdLabel.index, usdLabel.index + 2_000);
  const rates = /Compra:\s*([\d.,]+)[\s\S]*?Venta:\s*([\d.,]+)/i.exec(
    usdSection,
  );
  if (!rates) {
    throw new Error("Italcambio response does not contain USD buy/sell rates");
  }
  return {
    buy: parseExternalRate(rates[1], "Italcambio"),
    sell: parseExternalRate(rates[2], "Italcambio"),
  };
}

export class BcvProvider implements RateProvider {
  readonly code = "BCV";
  async collect(): Promise<ProviderQuote[]> {
    const rates = await fetchBcvRates();
    const observedAt = now();
    return [
      {
        providerCode: this.code,
        pairCode: "USD/VES",
        buy: rates.usd,
        sell: rates.usd,
        status: "verified",
        observedAt,
      },
      {
        providerCode: this.code,
        pairCode: "EUR/VES",
        buy: rates.eur,
        sell: rates.eur,
        status: "verified",
        observedAt,
      },
    ];
  }
}

export class BinanceP2pProvider implements RateProvider {
  readonly code = "BINANCE_P2P";
  async collect(): Promise<ProviderQuote[]> {
    const [buy, sell] = await Promise.all([
      fetchBinancePrice("BUY"),
      fetchBinancePrice("SELL"),
    ]);
    return [
      {
        providerCode: this.code,
        pairCode: "USDT/VES",
        buy,
        sell,
        status: "verified",
        observedAt: now(),
      },
    ];
  }
}

export class ItalcambiosProvider implements RateProvider {
  readonly code = "ITALCAMBIOS";
  async collect(): Promise<ProviderQuote[]> {
    const rates = extractItalcambioRates(
      await fetchText(ITALCAMBIO_URL, "Italcambio"),
    );
    return [
      {
        providerCode: this.code,
        pairCode: "USD/VES",
        buy: rates.buy,
        sell: rates.sell,
        status: "verified",
        observedAt: now(),
      },
    ];
  }
}
