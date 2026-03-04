import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";

import "@/app/globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"),
  title: "GEN-H Studio | Premium Revenue Systems for Elite HVAC Brands",
  description:
    "Luxury-grade digital infrastructure for HVAC operators: premium acquisition sites, quoting funnels, and revenue orchestration deployed on Vercel.",
  openGraph: {
    title: "GEN-H Studio",
    description:
      "Premium websites and revenue systems for HVAC operators that need more booked jobs, stronger margins, and cleaner field operations.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
