import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("currencies")
export class Currency {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) code!: string;
  @Column() name!: string;
  @Column({ default: 2 }) decimals!: number;
  @Column({ default: true }) is_active!: boolean;
}

@Entity("providers")
export class Provider {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) code!: string;
  @Column() name!: string;
  @Column({ default: "market" }) kind!: string;
  @Column({ default: true }) is_active!: boolean;
  @Column({ type: "text", nullable: true }) base_url!: string | null;
  @Column({ type: "text", nullable: true }) config_json!: string | null;
  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}

@Entity("currency_pairs")
@Index(["base_currency_id", "quote_currency_id"], { unique: true })
export class CurrencyPair {
  @PrimaryGeneratedColumn() id!: number;
  @Column() code!: string;
  @Column() base_currency_id!: number;
  @Column() quote_currency_id!: number;
  @Column({ default: true }) is_active!: boolean;
}

@Entity("current_quotes")
@Index(["provider_id", "pair_id"], { unique: true })
export class CurrentQuote {
  @PrimaryGeneratedColumn() id!: number;
  @Column() provider_id!: number;
  @Column() pair_id!: number;
  @Column("integer") buy_scaled!: number;
  @Column("integer", { nullable: true }) sell_scaled!: number | null;
  @Column("integer") scale!: number;
  @Column({ default: "verified" }) status!: string;
  @Column({ type: "text", nullable: true }) source_reference!: string | null;
  @Column({ type: "text", nullable: true }) metadata_json!: string | null;
  @Column({ type: "datetime" }) observed_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}

@Entity("quote_history")
@Index(["provider_id", "pair_id", "recorded_at"])
export class QuoteHistory {
  @PrimaryGeneratedColumn() id!: number;
  @Column() provider_id!: number;
  @Column() pair_id!: number;
  @Column("integer") buy_scaled!: number;
  @Column("integer", { nullable: true }) sell_scaled!: number | null;
  @Column("integer") scale!: number;
  @Column({ default: "verified" }) status!: string;
  @Column() sync_run_id!: number;
  @CreateDateColumn() @Index() recorded_at!: Date;
}

@Entity("sync_runs")
@Index(["started_at"])
export class SyncRun {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ default: "running" }) status!: string;
  @Column("integer", { default: 0 }) provider_count!: number;
  @Column("integer", { default: 0 }) quote_count!: number;
  @Column({ type: "text", nullable: true }) error_message!: string | null;
  @CreateDateColumn() started_at!: Date;
  @Column({ type: "datetime", nullable: true }) finished_at!: Date | null;
}

@Entity("api_plans")
export class ApiPlan {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) code!: string;
  @Column() name!: string;
  @Column("integer") monthly_limit!: number;
  @Column({ default: true }) is_active!: boolean;
}

@Entity("developers")
export class Developer {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) email!: string;
  @Column({ default: true }) is_active!: boolean;
  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}

@Entity("api_keys")
@Index(["key_hash"], { unique: true })
export class ApiKey {
  @PrimaryGeneratedColumn() id!: number;
  @Column() developer_id!: number;
  @Column() plan_id!: number;
  @Column() key_prefix!: string;
  @Column() key_hash!: string;
  @Column({ default: true }) is_active!: boolean;
  @Column({ type: "datetime", nullable: true }) last_used_at!: Date | null;
  @CreateDateColumn() created_at!: Date;
  @Column({ type: "datetime", nullable: true }) revoked_at!: Date | null;
}

@Entity("api_key_usage_daily")
@Index(["api_key_id", "period_start"], { unique: true })
export class ApiKeyUsageDaily {
  @PrimaryGeneratedColumn() id!: number;
  @Column() api_key_id!: number;
  @Column({ type: "date" }) period_start!: string;
  @Column("integer", { default: 0 }) request_count!: number;
  @Column({ type: "text", nullable: true }) endpoint_counts_json!:
    | string
    | null;
}

@Entity("magic_links")
@Index(["token_hash"], { unique: true })
export class MagicLink {
  @PrimaryGeneratedColumn() id!: number;
  @Column() email!: string;
  @Column({ default: "free" }) plan_code!: string;
  @Column() token_hash!: string;
  @Column({ type: "datetime" }) expires_at!: Date;
  @Column({ type: "datetime", nullable: true }) consumed_at!: Date | null;
  @CreateDateColumn() created_at!: Date;
}

@Entity("backup_runs")
export class BackupRun {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ default: "google-drive" }) provider!: string;
  @Column({ default: "running" }) status!: string;
  @Column({ type: "text", nullable: true }) remote_file_id!: string | null;
  @Column({ type: "text", nullable: true }) checksum!: string | null;
  @Column("integer", { nullable: true }) size_bytes!: number | null;
  @Column({ type: "text", nullable: true }) error_message!: string | null;
  @CreateDateColumn() started_at!: Date;
  @Column({ type: "datetime", nullable: true }) finished_at!: Date | null;
}
