import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@google/generative-ai"],
  experimental: {
    // serverComponentsExternalPackages moved to root in Next.js 15+
  },
};

export default nextConfig;
