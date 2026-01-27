"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { signIn, auth } from "@/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { eq } from "drizzle-orm";

const AuthSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }),
    name: z.string().optional(),
});

export type AuthResponse = {
    success?: string;
    error?: string;
};

export async function signUp(formData: FormData): Promise<AuthResponse> {
    const validatedFields = AuthSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0]?.message ?? "Validation failed" };
    }

    const { email, password, name } = validatedFields.data;

    try {
        const existingUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email),
        });

        if (existingUser) {
            return { error: "User already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            email,
            password: hashedPassword,
            name,
        });

        return { success: "User created successfully" };
    } catch (error) {
        console.error("Signup error:", error);
        return { error: "Internal server error" };
    }
}

export async function login(formData: FormData): Promise<AuthResponse> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        return { success: "Logged in successfully" };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" };
                default:
                    return { error: "Something went wrong" };
            }
        }
        // For non-AuthErrors (like redirects), we should re-throw
        throw error;
    }
}

export async function deleteAccount(): Promise<AuthResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        await db.delete(users).where(eq(users.id, userId));
        return { success: "Account and all associated data purged successfully" };
    } catch (error) {
        console.error("Delete account error:", error);
        return { error: "Failed to purge account data" };
    }
}
