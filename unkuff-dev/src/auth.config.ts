import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
    providers: [
        // We'll provide a dummy provider here for type safety in middleware
        // The actual authorize logic stays in auth.ts which runs in Node.js
        Credentials({
            authorize: async () => null
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboard = nextUrl.pathname.startsWith("/dashboard");

            if (isDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }
            return true;
        },
    },
} satisfies NextAuthConfig;
