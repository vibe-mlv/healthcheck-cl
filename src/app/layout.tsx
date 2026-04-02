import type { Metadata } from "next";
import { Crimson_Pro, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MapLovin Health Check Demo",
  description: "15-second Google Maps location health check demo built for MapLovin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${crimsonPro.variable} ${plusJakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
