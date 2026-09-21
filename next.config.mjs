/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 骨架阶段先不阻塞构建，ESLint 配置仍保留供 `npm run lint` 使用
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
