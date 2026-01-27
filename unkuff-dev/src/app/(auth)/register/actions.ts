"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface RegisterResult {
    success?: boolean;
    error?: string;
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
    try {
        const { name, email, password } = input;

        // Validate input
        if (!name || !email || !password) {
            return { error: "All fields are required." };
        }

        if (password.length < 8) {
            return { error: "Password must be at least 8 characters." };
        }

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase()),
        });

        if (existingUser) {
            return { error: "An account with this email already exists." };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        await db.insert(users).values({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "An unexpected error occurred. Please try again." };
    }
}
