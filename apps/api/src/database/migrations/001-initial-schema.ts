import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema001 implements MigrationInterface {
  name = "InitialSchema001";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "currencies" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "code" varchar NOT NULL UNIQUE, "name" varchar NOT NULL, "decimals" integer NOT NULL DEFAULT (2), "is_active" boolean NOT NULL DEFAULT (1))`,
    );
    await queryRunner.query(
      `CREATE TABLE "providers" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "code" varchar NOT NULL UNIQUE, "name" varchar NOT NULL, "kind" varchar NOT NULL DEFAULT ('market'), "is_active" boolean NOT NULL DEFAULT (1), "base_url" text, "config_json" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "currency_pairs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "code" varchar NOT NULL, "base_currency_id" integer NOT NULL, "quote_currency_id" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT (1), CONSTRAINT "UQ_currency_pair" UNIQUE ("base_currency_id", "quote_currency_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "current_quotes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "provider_id" integer NOT NULL, "pair_id" integer NOT NULL, "buy_scaled" integer NOT NULL, "sell_scaled" integer, "scale" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('verified'), "source_reference" text, "metadata_json" text, "observed_at" datetime NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_current_quote" UNIQUE ("provider_id", "pair_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "quote_history" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "provider_id" integer NOT NULL, "pair_id" integer NOT NULL, "buy_scaled" integer NOT NULL, "sell_scaled" integer, "scale" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('verified'), "sync_run_id" integer NOT NULL, "recorded_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sync_runs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "status" varchar NOT NULL DEFAULT ('running'), "provider_count" integer NOT NULL DEFAULT (0), "quote_count" integer NOT NULL DEFAULT (0), "error_message" text, "started_at" datetime NOT NULL DEFAULT (datetime('now')), "finished_at" datetime)`,
    );
    await queryRunner.query(
      `CREATE TABLE "api_plans" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "code" varchar NOT NULL UNIQUE, "name" varchar NOT NULL, "monthly_limit" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT (1))`,
    );
    await queryRunner.query(
      `CREATE TABLE "developers" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL UNIQUE, "is_active" boolean NOT NULL DEFAULT (1), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "api_keys" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "developer_id" integer NOT NULL, "plan_id" integer NOT NULL, "key_prefix" varchar NOT NULL, "key_hash" varchar NOT NULL UNIQUE, "is_active" boolean NOT NULL DEFAULT (1), "last_used_at" datetime, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "revoked_at" datetime)`,
    );
    await queryRunner.query(
      `CREATE TABLE "api_key_usage_daily" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "api_key_id" integer NOT NULL, "period_start" date NOT NULL, "request_count" integer NOT NULL DEFAULT (0), "endpoint_counts_json" text, CONSTRAINT "UQ_api_usage_day" UNIQUE ("api_key_id", "period_start"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "magic_links" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "token_hash" varchar NOT NULL UNIQUE, "expires_at" datetime NOT NULL, "consumed_at" datetime, "created_at" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "backup_runs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "provider" varchar NOT NULL DEFAULT ('google-drive'), "status" varchar NOT NULL DEFAULT ('running'), "remote_file_id" text, "checksum" text, "size_bytes" integer, "error_message" text, "started_at" datetime NOT NULL DEFAULT (datetime('now')), "finished_at" datetime)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quote_history_lookup" ON "quote_history" ("provider_id", "pair_id", "recorded_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sync_runs_started" ON "sync_runs" ("started_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_usage_key_period" ON "api_key_usage_daily" ("api_key_id", "period_start")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      "backup_runs",
      "magic_links",
      "api_key_usage_daily",
      "api_keys",
      "developers",
      "api_plans",
      "sync_runs",
      "quote_history",
      "current_quotes",
      "currency_pairs",
      "providers",
      "currencies",
    ]) {
      await queryRunner.query(`DROP TABLE "${table}"`);
    }
  }
}
