import type { MigrationInterface, QueryRunner } from "typeorm";

export class DeduplicateQuoteHistory2026080500003
  implements MigrationInterface
{
  name = "DeduplicateQuoteHistory2026080500003";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "quote_history"
      WHERE "id" NOT IN (
        SELECT MIN("id")
        FROM "quote_history"
        GROUP BY "provider_id", "pair_id", date("recorded_at"), "buy_scaled", COALESCE("sell_scaled", -1), "status"
      )
    `);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // Deduplication is intentionally irreversible; new syncs remain idempotent.
  }
}
