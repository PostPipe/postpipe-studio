import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://studio.postpipe.in` : "https://postpipe-studio.vercel.app")
  ),
  title: "PostPipe Studio | Visual Backend Architecture Engine",
  description: "Design production-ready APIs, databases, and logic visually. Transform complex requirements into elegant architecture without writing boilerplate code.",
  keywords: ["backend design", "visual programming", "API generator", "database architecture", "no-code backend", "PostPipe"],
  authors: [{ name: "PostPipe Team" }],
  creator: "PostPipe",
  publisher: "PostPipe Studio",
  icons: {
    icon: "/Postpipe-Studio.ico",
    shortcut: "/Postpipe-Studio.ico",
    apple: "/Postpipe-Studio.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://postpipe-studio.vercel.app",
    title: "PostPipe Studio | Visual Backend Architecture Engine",
    description: "Design production-ready APIs, databases, and logic visually. The next generation of backend development.",
    siteName: "PostPipe Studio",
    images: [
      {
        url: "/og-image.png", // Assuming this will be created or exists
        width: 1200,
        height: 630,
        alt: "PostPipe Studio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostPipe Studio | Visual Backend Architecture Engine",
    description: "Design production-ready APIs, databases, and logic visually.",
    images: ["/og-image.png"],
    creator: "@postpipe_ai",
  },
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
        <Toaster position="top-center" richColors theme="dark" />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
