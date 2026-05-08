import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://www.googletagservices.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https:; frame-src 'self' https://www.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
