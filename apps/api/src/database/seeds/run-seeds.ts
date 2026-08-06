import "reflect-metadata";
import type {
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { AppDataSource } from "../data-source";
import { ApiPlan, Currency, CurrencyPair, Provider } from "../entities";

async function saveByNaturalKey<Entity extends ObjectLiteral>(
  repository: Repository<Entity>,
  naturalKey: FindOptionsWhere<Entity>,
  values: DeepPartial<Entity>,
): Promise<Entity> {
  const existing = await repository.findOneBy(naturalKey);
  return repository.save(
    existing ? repository.merge(existing, values) : repository.create(values),
  );
}

export async function seedDataSource(dataSource: DataSource): Promise<void> {
  const currencyRepo = dataSource.getRepository(Currency);
  const providerRepo = dataSource.getRepository(Provider);
  const pairRepo = dataSource.getRepository(CurrencyPair);
  const planRepo = dataSource.getRepository(ApiPlan);

  for (const currency of [
    { code: "USD", name: "Dólar estadounidense", decimals: 2 },
    { code: "USDT", name: "Tether USD", decimals: 2 },
    { code: "EUR", name: "Euro", decimals: 2 },
    { code: "VES", name: "Bolívar digital", decimals: 2 },
  ])
    await saveByNaturalKey(currencyRepo, { code: currency.code }, currency);

  for (const provider of [
    { code: "BCV", name: "Banco Central de Venezuela", kind: "official" },
    { code: "BINANCE_P2P", name: "Binance P2P", kind: "p2p" },
    { code: "ITALCAMBIOS", name: "Italcambios", kind: "market" },
  ])
    await saveByNaturalKey(providerRepo, { code: provider.code }, provider);

  const ves = await currencyRepo.findOneByOrFail({ code: "VES" });
  for (const base of ["USD", "USDT", "EUR"]) {
    const currency = await currencyRepo.findOneByOrFail({ code: base });
    await saveByNaturalKey(
      pairRepo,
      {
        base_currency_id: currency.id,
        quote_currency_id: ves.id,
      },
      {
        code: `${base}/VES`,
        base_currency_id: currency.id,
        quote_currency_id: ves.id,
      },
    );
  }

  for (const plan of [
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
  ])
    await saveByNaturalKey(planRepo, { code: plan.code }, plan);
}

async function runSeeds(): Promise<void> {
  await AppDataSource.initialize();
  try {
    await seedDataSource(AppDataSource);
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  runSeeds().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
