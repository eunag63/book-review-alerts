import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // mobile-app 폴더를 Next.js 처리에서 완전 제외
  webpack: (config, { isServer }) => {
    // mobile-app 폴더 완전 무시
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/mobile-app/**', '**/node_modules/**']
    };
    return config;
  }
};

export default nextConfig;
