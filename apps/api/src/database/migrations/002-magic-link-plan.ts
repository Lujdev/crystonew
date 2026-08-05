import type { MigrationInterface, QueryRunner } from "typeorm";

export class MagicLinkPlan2026080502 implements MigrationInterface {
  name = "MagicLinkPlan2026080502";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "magic_links" ADD COLUMN "plan_code" varchar NOT NULL DEFAULT ('free')`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "magic_links" DROP COLUMN "plan_code"`,
    );
  }
}
