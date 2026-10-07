import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production build for Docker: `next build` also writes `.next/standalone`,
  // a self-contained server (`server.js` + only the `node_modules` files the
  // app really imports). The image copies that folder instead of the whole
  // `node_modules` — see Dockerfile.
  output: "standalone",
  // Prisma's generated client and the `pg` driver use Node APIs (native
  // bindings, fs) that the bundler shouldn't try to trace/bundle for the
  // server runtime — run them as plain external requires instead.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  images: {
    // AVIF first for the browsers that accept it (smaller files for the same
    // photo), WebP for the others. Each size is encoded once, then cached.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
