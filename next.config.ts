import type { NextConfig } from "next";

// const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
// const { hostname: apiHost, port: apiPort } = new URL(apiUrl);

const nextConfig: NextConfig = {
  allowedDevOrigins: ['vivisectible-wava-preshrunk.ngrok-free.dev'],
  images: {
    unoptimized: true,
    // remotePatterns: [
      /**
       * Any HTTPS host. The product team pastes image URLs from wherever their
       * assets live (S3, Cloudinary, a supplier's CDN), so an allowlist would
       * need editing every time — a config change to publish a product is the
       * wrong workflow.
       */
      // { protocol: "https", hostname: "**" },

      /** HTTP stays pinned to the API host, for local /uploads in dev. */
      // { protocol: "http", hostname: apiHost, port: apiPort || undefined },
    // ],
    // formats: ["image/avif", "image/webp"],
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920],
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
    return [{ source: "/product/:id", destination: "/collections", permanent: false }];
  },

   async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_ORIGIN ?? 'http://localhost:5000'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;