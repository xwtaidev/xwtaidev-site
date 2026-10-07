import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteProvider } from "@/components/site-provider";
import { profile } from "@/content/site";
import { themeFavicons, themeBootstrap } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.description,
};

export const viewport: Viewport = { colorScheme: "light dark" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link id="site-icon" rel="icon" href={themeFavicons.light} type="image/x-icon" sizes="16x16 32x32 48x48 64x64" suppressHydrationWarning />
        <script id="theme-bootstrap" dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
