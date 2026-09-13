import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets her iPhone load the dev server over Wi-Fi via the LAN address
  // (http://192.168.2.3:3000) - Next.js blocks cross-origin dev asset
  // requests by default, which otherwise leaves every client component
  // stuck unhydrated (empty blocks, dead nav) on any device but this one.
  allowedDevOrigins: ["192.168.2.3"],
};

export default nextConfig;
