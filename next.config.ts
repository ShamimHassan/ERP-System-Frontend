import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Remove all console.* calls in production builds
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error"] }  // keep console.error, strip everything else
      : false,
  },

  // Cache-Control headers — prevent stale HTML causing 404 chunk errors
  // after a new deployment. JS/CSS static assets are immutable (hashed).
  async headers() {
    return [
      {
        // HTML pages — must revalidate on every navigation so the browser
        // always fetches the latest HTML with correct chunk URLs.
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Next.js static assets (_next/static) are content-hashed →
        // safe to cache for 1 year.
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
