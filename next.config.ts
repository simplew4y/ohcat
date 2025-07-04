import type { NextConfig } from "next";

const nextConfig: NextConfig = {

   	/* config options here */
	 eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 如果也想跳过 TypeScript 检查
  },
};

export default nextConfig;
