import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: {
    default: "Events.Masjids.io",
    template: "%s · Events.Masjids.io",
  },
  description:
    "Discover and attend Muslim community events, hangouts, and clubs near you.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Events.Masjids.io",
    title: "Events.Masjids.io",
    description: "Muslim community events, hangouts, and clubs near you.",
  },
};

export const viewport: Viewport = {
  themeColor: "#002d1f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Material Symbols preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-surface text-on-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
