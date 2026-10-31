import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "25mb",
  },

  allowedDevOrigins: ["vivisectible-wava-preshrunk.ngrok-free.dev"],
  images: {
    unoptimized: true,
  },

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      /* The listing moved from /collections to /products. Permanent, so Google
         and old bookmarks update; query strings (?badge=bestseller) carry over. */
      { source: "/collections", destination: "/products", permanent: true },
      { source: "/product/:id", destination: "/products", permanent: false },
      /* The panel's front door. A real 307 here, not redirect() in a page: the
         prerendered page carried the redirect inside its payload, and acting on
         it while AdminShell was still checking the session sometimes crashed
         the page ("This page couldn't load"). */
      { source: "/admin", destination: "/admin/design-builder", permanent: false },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.BACKEND_ORIGIN ?? "http://localhost:5000"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
