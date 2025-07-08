import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/app/providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "AI 팀 빌딩 매니저",
  description: "AI와 함께 최고의 팀을 만들어보세요.",
};

import Header from "@/app/components/common/Header";
import Footer from "@/app/components/common/Footer";

// ... (기존 import 구문들)

// ... (기존 font, metadata 설정)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
