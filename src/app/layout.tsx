import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import { NextAuthProvider } from "@/context/NextAuthProvider";
import { PremiumProvider } from "@/context/PremiumContext";
import { AuthProvider } from "@/context/AuthContext";
import { CardProvider } from "@/context/CardContext";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "암기훈련소",
  description: "플래시카드로 효과적으로 암기하는 방법",
  // Vercel 배포 분석 및 피드백 툴바 비활성화
  other: {
    "vercel-toolbar-disabled": "true"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="vercel-toolbar-disabled" content="true" />
        {/* 아임포트 결제 SDK */}
        <Script
          src="https://cdn.iamport.kr/v1/iamport.js"
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-[var(--background)]">
        <NextAuthProvider>
          <AuthProvider>
            <PremiumProvider>
              <CardProvider>
                {children}
                <SessionTimeoutWrapper />
              </CardProvider>
            </PremiumProvider>
          </AuthProvider>
        </NextAuthProvider>
        
        {/* 카카오 애드핏 광고 스크립트 */}
        <Script
          src="https://t1.daumcdn.net/kas/static/ba.min.js"
          async
        />
      </body>
    </html>
  );
}