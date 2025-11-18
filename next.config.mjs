/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  typedRoutes: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    typedEnv: true,
  },
};

export default nextConfig;
