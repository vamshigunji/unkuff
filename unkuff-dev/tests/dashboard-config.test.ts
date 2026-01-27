import { describe, it, expect } from "vitest";
import { KANBAN_COLUMNS } from "@/features/dashboard/types";

describe("Dashboard Configuration", () => {
    it("should define exactly 4 columns", () => {
        expect(KANBAN_COLUMNS).toHaveLength(4);
    });

    it("should have the correct column IDs", () => {
        const ids = KANBAN_COLUMNS.map((c) => c.id);
        expect(ids).toEqual(["recommended", "applied", "interviewing", "offer"]);
    });
});
