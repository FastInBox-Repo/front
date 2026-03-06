import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

const DEFAULT_PUBLIC_API_URL = "http://localhost:4001";
const DEFAULT_DEV_SERVER_API_URL = "http://localhost:4001";

function normalizeUrl(value?: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue.replace(/\/$/, "");
}

function getServerApiBaseUrl() {
  const internalApiUrl = normalizeUrl(process.env.INTERNAL_API_URL);

  if (internalApiUrl) {
    return internalApiUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEV_SERVER_API_URL;
  }

  return normalizeUrl(process.env.NEXT_PUBLIC_API_URL) || DEFAULT_PUBLIC_API_URL;
}

function getAllowedDevOrigins() {
  const interfaces = networkInterfaces();
  const origins = new Set(["localhost", "127.0.0.1"]);

  for (const networkDetails of Object.values(interfaces)) {
    for (const networkInterface of networkDetails || []) {
      if (
        networkInterface &&
        networkInterface.family === "IPv4" &&
        !networkInterface.internal
      ) {
        origins.add(networkInterface.address);
      }
    }
  }

  return Array.from(origins);
}

const apiProxyTarget = getServerApiBaseUrl();

const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: getAllowedDevOrigins(),
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;
