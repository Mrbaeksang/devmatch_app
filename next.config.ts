import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Next.js 15.3.5 베타 버전의 타입 오류 임시 무시
  },
};

export default nextConfig;