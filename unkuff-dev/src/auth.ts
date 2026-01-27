import NextAuth, { type DefaultSession } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Type augmentation for session user
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db, {
        usersTable: schema.users,
        accountsTable: schema.accounts,
        sessionsTable: schema.sessions,
        verificationTokensTable: schema.verificationTokens,
    }),
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db.query.users.findFirst({
                    where: (users, { eq }) =>
                        eq(users.email, credentials.email as string),
                });

                if (!user || !user.password) return null;

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (passwordsMatch) return user;

                return null;
            },
        }),
    ],
    callbacks: {
        // Add user ID to the JWT token
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        // Add user ID to the session from the JWT token
        session({ session, token }) {
            if (token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});
