import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.env['npm_config_local_prefix'] ?? process.cwd(),
  },
};

export default nextConfig;
