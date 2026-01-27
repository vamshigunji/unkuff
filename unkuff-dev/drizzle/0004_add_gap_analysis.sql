DROP INDEX "job_embedding_idx";--> statement-breakpoint
ALTER TABLE "job_match" ADD COLUMN "gap_analysis" jsonb;