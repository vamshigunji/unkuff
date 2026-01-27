ALTER TABLE "education" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "skill" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "work_experience" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
CREATE INDEX "job_title_idx" ON "job" USING btree ("title");--> statement-breakpoint
CREATE INDEX "edu_profile_id_idx" ON "education" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "profile_user_id_idx" ON "profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "skill_profile_id_idx" ON "skill" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "work_exp_profile_id_idx" ON "work_experience" USING btree ("profile_id");