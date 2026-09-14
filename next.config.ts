import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  // Renders app/global-not-found.tsx for unmatched URLs and pre-stream
  // notFound() calls. Needed because this app has two root layouts and a
  // dynamic-segment root layout, so a 404 cannot compose one.
  experimental: {
    globalNotFound: true,
  },
  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
