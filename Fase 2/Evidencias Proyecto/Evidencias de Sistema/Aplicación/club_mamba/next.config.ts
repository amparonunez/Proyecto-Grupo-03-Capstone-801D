import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignorar TODOS los errores de TypeScript en build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignorar TODOS los errores/warnings de ESLint en build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Tu configuración personalizada (SVG)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
