import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // A 10 MiB file plus bounded multipart/form fields. File size is checked again server-side.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
