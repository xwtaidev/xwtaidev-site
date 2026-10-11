import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

export default function config(phase: string): NextConfig {
  return {
    // Let newly created Markdown slugs resolve immediately during local writing.
    // Production still exports only the published generateStaticParams routes.
    output: phase === PHASE_DEVELOPMENT_SERVER ? undefined : "export",
    images: { unoptimized: true },
    agentRules: false,
    devIndicators: false,
  };
}
