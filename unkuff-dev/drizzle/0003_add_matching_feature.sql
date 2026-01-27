CREATE TYPE "public"."experience_level" AS ENUM('internship', 'entry', 'associate', 'mid-senior', 'director', 'executive', 'not-specified');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('recommended', 'applied', 'interviewing', 'offer', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('remote', 'hybrid', 'on-site', 'unknown');--> statement-breakpoint
CREATE TABLE "accomplishment" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"impact" text,
	"category" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "award" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"title" text NOT NULL,
	"issuer" text,
	"date" timestamp,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certification" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"issue_date" timestamp,
	"expiry_date" timestamp,
	"credential_id" text,
	"link" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "language" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"name" text NOT NULL,
	"proficiency" text
);
--> statement-breakpoint
CREATE TABLE "power_statement" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"statement" text NOT NULL,
	"context" text,
	"category" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"link" text,
	"technologies" jsonb,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_link" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_match" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"job_id" text NOT NULL,
	"score" integer NOT NULL,
	"raw_similarity" real,
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP INDEX "job_title_idx";--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company" text NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "latitude" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "longitude" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "work_mode" "work_mode" DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "experience_level" "experience_level" DEFAULT 'not-specified';--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "employment_type" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "salary_snippet" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "min_salary" integer;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "max_salary" integer;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "salary_currency" text DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "salary_unit" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "description_html" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "snippet" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "skills" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "benefits" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "qualifications" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "responsibilities" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "source_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "apply_url" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "source_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "source_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "source_actor_id" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "applications_count" integer;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "recruiter_name" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "recruiter_url" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company_website" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company_industry" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company_logo" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company_revenue" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company_employees_count" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company_rating" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company_ratings_count" integer;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company_ceo_name" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "company_description" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "technographics" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "status" "job_status" DEFAULT 'recommended' NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "posted_at" timestamp;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "raw_content" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "id_number" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "hobbies" jsonb;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "interests" jsonb;--> statement-breakpoint
ALTER TABLE "work_experience" ADD COLUMN "accomplishments" jsonb;--> statement-breakpoint
ALTER TABLE "work_experience" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "work_experience" ADD COLUMN "is_current" text DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "accomplishment" ADD CONSTRAINT "accomplishment_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "award" ADD CONSTRAINT "award_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification" ADD CONSTRAINT "certification_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language" ADD CONSTRAINT "language_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "power_statement" ADD CONSTRAINT "power_statement_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_link" ADD CONSTRAINT "social_link_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_match" ADD CONSTRAINT "job_match_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_match" ADD CONSTRAINT "job_match_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accomplishment_profile_id_idx" ON "accomplishment" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "award_profile_id_idx" ON "award" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "cert_profile_id_idx" ON "certification" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "lang_profile_id_idx" ON "language" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "power_statement_profile_id_idx" ON "power_statement" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "project_profile_id_idx" ON "project" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "social_link_profile_id_idx" ON "social_link" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_match_user_job_idx" ON "job_match" USING btree ("user_id","job_id");--> statement-breakpoint
CREATE INDEX "job_match_user_idx" ON "job_match" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_match_score_idx" ON "job_match" USING btree ("score");--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_user_id_idx" ON "job" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_hash_idx" ON "job" USING btree ("hash");--> statement-breakpoint
CREATE UNIQUE INDEX "job_unique_idx" ON "job" USING btree ("user_id","hash");--> statement-breakpoint
CREATE INDEX "job_status_idx" ON "job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_title_lookup_idx" ON "job" USING btree ("title");--> statement-breakpoint
CREATE INDEX "job_embedding_idx" ON "job" USING btree ("embedding");--> statement-breakpoint
CREATE INDEX "job_company_idx" ON "job" USING btree ("company");