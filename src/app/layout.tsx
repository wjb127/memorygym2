import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';

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
    <html lang="ko">
      <head>
        <meta name="vercel-toolbar-disabled" content="true" />
        {/* 아임포트 결제 SDK */}
        <Script
          src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}