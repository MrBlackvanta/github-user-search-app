import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactCompiler: true,
  experimental: { inlineCss: true },
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
