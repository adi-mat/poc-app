/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
  ...nextConfig,
  experimental: {
    serverComponentsExternalPackages: ["docusign-esign"],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
