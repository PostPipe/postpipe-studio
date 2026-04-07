import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SmoothScroll } from "@/components/ui/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PostPipe Studio | Design Your Backend",
  description: "APIs, databases, and logic — designed, not coded.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="bg-[#0a0a0b]" suppressHydrationWarning>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
