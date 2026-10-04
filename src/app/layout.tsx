import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteProvider } from "@/components/site-provider";
import { profile } from "@/content/site";
import { themeBootstrap } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.description,
  icons: { icon: "/assets/avatar.jpg" },
};

export const viewport: Viewport = { colorScheme: "light dark" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script id="theme-bootstrap" dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
