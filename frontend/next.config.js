/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en", "ja"],
    defaultLocale: "en",
  },
  images: {
    domains: ["localhost", "ipfs.mintrally.xyz"],
  },
};

module.exports = nextConfig;
