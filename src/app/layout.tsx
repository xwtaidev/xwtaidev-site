import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteProvider } from "@/components/site-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { StructuredData } from "@/components/structured-data";
import { getSiteStructuredData } from "@/lib/structured-data";
import { createSocialMetadata, siteUrl, socialPages } from "@/lib/social";
import { localeBootstrap } from "@/lib/i18n";
import { themeFavicons, themePngFavicons, themeSvgFavicons, themeColors, themeBootstrap } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...createSocialMetadata(socialPages.home),
  manifest: "/site.webmanifest",
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = { colorScheme: "light dark", themeColor: themeColors.light };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link id="site-icon" rel="icon" href={themeFavicons.light} type="image/x-icon" sizes="16x16 32x32 48x48 64x64" suppressHydrationWarning />
        <link id="site-icon-png" rel="icon" href={themePngFavicons.light} type="image/png" sizes="32x32" suppressHydrationWarning />
        <link id="site-icon-svg" rel="icon" href={themeSvgFavicons.light} type="image/svg+xml" sizes="any" suppressHydrationWarning />
        <script id="theme-bootstrap" dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <script id="locale-bootstrap" dangerouslySetInnerHTML={{ __html: localeBootstrap }} />
      </head>
      <body>
        <StructuredData data={getSiteStructuredData()} />
        <LocaleProvider><SiteProvider>{children}</SiteProvider></LocaleProvider>
      </body>
    </html>
  );
}
