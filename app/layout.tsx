import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "sonner";
import IsOnline from "@/components/IsOnline";

export const metadata: Metadata = {
  title: "What's App Clone - Aditya Rawat",
  description: "What's App Clone. Nextjs Firebase",
  generator: "Aditya",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Toaster />
          <IsOnline />
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
