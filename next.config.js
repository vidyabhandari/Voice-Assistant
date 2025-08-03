const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable support for .wasm modules
  webpack(config) {
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource', // Emit .wasm files to the output directory
    });
    return config;
  },

  // Required for ESM Workers and dynamic WASM imports
  experimental: {
    esmExternals: true,
  },
};

module.exports = withPWA(nextConfig);
