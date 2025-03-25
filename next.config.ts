import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vspepsxslxcxayseysyc.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
