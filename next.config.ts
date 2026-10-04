import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  agentRules: false,
  devIndicators: false,
};

export default config;
