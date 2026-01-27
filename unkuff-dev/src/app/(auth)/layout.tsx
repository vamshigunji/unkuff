import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // If already logged in, redirect to dashboard
    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}
