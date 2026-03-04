import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import "@/app/globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"]
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"),
  title: "GEN-H Studio | Premium HVAC Growth Systems",
  description:
    "A sleek full-stack site for HVAC growth: clear public positioning, structured lead capture, and a secure admin portal for operators.",
  openGraph: {
    title: "GEN-H Studio",
    description:
      "Premium websites and operator-ready lead systems for HVAC companies that need a better buying experience and a clearer pipeline.",
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
