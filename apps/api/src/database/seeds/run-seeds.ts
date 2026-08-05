import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { ApiPlan, Currency, CurrencyPair, Provider } from "../entities";

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  const currencyRepo = AppDataSource.getRepository(Currency);
  const providerRepo = AppDataSource.getRepository(Provider);
  const pairRepo = AppDataSource.getRepository(CurrencyPair);
  const planRepo = AppDataSource.getRepository(ApiPlan);

  for (const currency of [
    { code: "USD", name: "Dólar estadounidense", decimals: 2 },
    { code: "USDT", name: "Tether USD", decimals: 2 },
    { code: "EUR", name: "Euro", decimals: 2 },
    { code: "VES", name: "Bolívar digital", decimals: 2 },
  ])
    await currencyRepo.upsert(currency, ["code"]);

  for (const provider of [
    { code: "BCV", name: "Banco Central de Venezuela", kind: "official" },
    { code: "BINANCE_P2P", name: "Binance P2P", kind: "p2p" },
    { code: "ITALCAMBIOS", name: "Italcambios", kind: "market" },
  ])
    await providerRepo.upsert(provider, ["code"]);

  const ves = await currencyRepo.findOneByOrFail({ code: "VES" });
  for (const base of ["USD", "USDT", "EUR"]) {
    const currency = await currencyRepo.findOneByOrFail({ code: base });
    await pairRepo.upsert(
      {
        code: `${base}/VES`,
        base_currency_id: currency.id,
        quote_currency_id: ves.id,
      },
      ["base_currency_id", "quote_currency_id"],
    );
  }

  await planRepo.upsert(
    [
      {
        code: "free",
        name: "Free",
        monthly_limit: Number(process.env.API_KEY_FREE_MONTHLY_LIMIT ?? 500),
      },
      {
        code: "development",
        name: "Development",
        monthly_limit: Number(
          process.env.API_KEY_DEVELOPMENT_MONTHLY_LIMIT ?? 10000,
        ),
      },
    ],
    ["code"],
  );
  await AppDataSource.destroy();
}

seed().catch(async (error: unknown) => {
  console.error(error);
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
  process.exitCode = 1;
});
