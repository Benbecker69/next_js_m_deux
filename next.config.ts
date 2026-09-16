import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma's generated client and the `pg` driver use Node APIs (native
  // bindings, fs) that the bundler shouldn't try to trace/bundle for the
  // server runtime — run them as plain external requires instead.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
