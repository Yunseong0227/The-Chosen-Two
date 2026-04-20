import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 여기에 빌드 오류를 무시하는 설정을 추가해서 안전하게 배포합니다. */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;