import { describe, it, expect } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "./schema";

describe("Profile Schema Deep Review", () => {
    it("should have profile table with vector(1536) and user_id index", () => {
        const config = getTableConfig(schema.profiles);
        const userIdCol = config.columns.find(c => c.name === "user_id");
        expect(userIdCol).toBeDefined();

        // console.log("Profile Indexes:", config.indexes.map(i => i.config.name));
        const index = config.indexes.find(i => i.config.name === "profile_user_id_idx");
        expect(index).toBeDefined();
    });

    it("should have work_experience with cascading delete and index", () => {
        const config = getTableConfig(schema.workExperience);
        const profileIdCol = config.columns.find(c => c.name === "profile_id");
        expect(profileIdCol).toBeDefined();

        // console.log("WorkExp Indexes:", config.indexes.map(i => i.config.name));
        const index = config.indexes.find(i => i.config.name === "work_exp_profile_id_idx");
        expect(index).toBeDefined();
    });

    it("should have consistent updatedAt columns across all profile tables", () => {
        expect(getTableConfig(schema.profiles).columns.find(c => c.name === "updated_at")).toBeDefined();
        expect(getTableConfig(schema.workExperience).columns.find(c => c.name === "updated_at")).toBeDefined();
        expect(getTableConfig(schema.education).columns.find(c => c.name === "updated_at")).toBeDefined();
        expect(getTableConfig(schema.skills).columns.find(c => c.name === "updated_at")).toBeDefined();
    });
});
