import type { Metadata } from "next";
import { IBM_Plex_Mono, Pixelify_Sans } from "next/font/google";
import "../styles/globals.css";

const pixel = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixel" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "BareIQ - Skincare Product Checks",
  description: "A blue, black, and white retro skincare app for product checks, product matches, and community threads.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${pixel.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
