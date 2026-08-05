import "reflect-metadata";
import { config } from "dotenv";
import { DataSource } from "typeorm";
import * as entities from "./entities";

config();

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: process.env.DATABASE_PATH ?? "data/crystodolar.sqlite",
  entities: Object.values(entities),
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});
