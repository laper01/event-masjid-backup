import type { Metadata, Viewport } from "next";
import "./globals.css";

/* ─────────────────────────────────────────────
   METADATA
   ───────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "Events.Masjids.io — The Human Touch in Digital Ticketing",
    template: "%s | Events.Masjids.io",
  },
  description:
    "Manage admissions with grace. Our comprehensive solution combines real-time revenue tracking with effortless QR entry for a seamless community experience.",
  keywords: [
    "masjid events",
    "mosque ticketing",
    "community events",
    "Islamic events",
    "QR check-in",
    "event management",
    "halal events",
    "Muslim community",
  ],
  authors: [{ name: "Events.Masjids.io" }],
  creator: "Events.Masjids.io",
  publisher: "Events.Masjids.io",
  metadataBase: new URL("https://events.masjids.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://events.masjids.io",
    siteName: "Events.Masjids.io",
    title: "Events.Masjids.io — The Human Touch in Digital Ticketing",
    description:
      "Manage admissions with grace. Real-time revenue tracking with effortless QR entry for your community.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Events.Masjids.io — Community Event Ticketing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events.Masjids.io — The Human Touch in Digital Ticketing",
    description:
      "Manage admissions with grace. Real-time revenue tracking with effortless QR entry for your community.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#004532",
  width: "device-width",
  initialScale: 1,
};

/* ─────────────────────────────────────────────
   ROOT LAYOUT
   ───────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body text-on-surface antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
