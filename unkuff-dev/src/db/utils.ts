import { customType } from "drizzle-orm/pg-core";

export const vector = customType<{ data: number[] }>({
    dataType() {
        return "vector(1536)";
    },
});
