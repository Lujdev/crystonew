import { DataSource } from "typeorm";
import * as entities from "../entities";
import { ApiPlan, Currency, CurrencyPair, Provider } from "../entities";
import { seedDataSource } from "./run-seeds";

describe("database seeds", () => {
  let dataSource: DataSource;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: "better-sqlite3",
      database: ":memory:",
      entities: Object.values(entities),
      synchronize: true,
    });
    await dataSource.initialize();
  });

  afterEach(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
  });

  test("fills a partial database and remains idempotent without changing ids", async () => {
    const currencyRepository = dataSource.getRepository(Currency);
    const existingUsd = await currencyRepository.save(
      currencyRepository.create({
        code: "USD",
        name: "Old name",
        decimals: 4,
      }),
    );

    await seedDataSource(dataSource);

    const firstIds = {
      currencies: (await currencyRepository.find()).map(({ id }) => id),
      providers: (await dataSource.getRepository(Provider).find()).map(
        ({ id }) => id,
      ),
      pairs: (await dataSource.getRepository(CurrencyPair).find()).map(
        ({ id }) => id,
      ),
      plans: (await dataSource.getRepository(ApiPlan).find()).map(
        ({ id }) => id,
      ),
    };
    expect(
      await currencyRepository.findOneByOrFail({ code: "USD" }),
    ).toMatchObject({
      id: existingUsd.id,
      name: "Dólar estadounidense",
      decimals: 2,
    });
    expect(
      Object.fromEntries(
        Object.entries(firstIds).map(([key, ids]) => [key, ids.length]),
      ),
    ).toEqual({
      currencies: 4,
      providers: 3,
      pairs: 3,
      plans: 2,
    });

    await seedDataSource(dataSource);

    expect((await currencyRepository.find()).map(({ id }) => id)).toEqual(
      firstIds.currencies,
    );
    expect(
      (await dataSource.getRepository(Provider).find()).map(({ id }) => id),
    ).toEqual(firstIds.providers);
    expect(
      (await dataSource.getRepository(CurrencyPair).find()).map(({ id }) => id),
    ).toEqual(firstIds.pairs);
    expect(
      (await dataSource.getRepository(ApiPlan).find()).map(({ id }) => id),
    ).toEqual(firstIds.plans);
  });
});
