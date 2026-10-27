/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    '/**': ['./prisma/**/*', './prisma/dev.db'],
  },
};

export default nextConfig;
