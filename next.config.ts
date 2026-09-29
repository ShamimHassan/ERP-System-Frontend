import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Remove all console.* calls in production builds
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: [] }   // strip every level (log, warn, error, info, debug)
      : false,
  },
};

export default nextConfig;
