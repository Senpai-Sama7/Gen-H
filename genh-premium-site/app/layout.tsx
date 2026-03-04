import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import { SmoothScroll } from "@/app/components/SmoothScroll";
import { CustomCursor } from "@/app/components/CustomCursor";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "GEN-H Studio | Premium HVAC Growth Systems",
  description:
    "Premium websites that convert. Clear offer. Clear action. HVAC growth systems with integrated lead qualification for high-ticket contractors.",
  openGraph: {
    title: "GEN-H Studio",
    description:
      "Premium HVAC growth systems with integrated lead qualification.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrains.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
        />
      </head>
      <body className="font-satoshi antialiased">
        <SmoothScroll>
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
