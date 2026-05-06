import type { Metadata } from "next";
import { Inter_Tight, Fraunces } from "next/font/google";
import "./globals.css";
import ChatbotWidget from '@/components/ChatbotWidget';

const interTight = Inter_Tight({ 
  subsets: ["latin"],
  display: "swap",
  variable: '--font-inter-tight',
});

const fraunces = Fraunces({ 
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: '--font-fraunces',
});

export const metadata: Metadata = {
  title: "PAMA Studio | Self Photo Studio",
  description: "Abadikan versi terbaikmu dengan mudah di PAMA Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`scroll-smooth ${interTight.variable} ${fraunces.variable}`}>
      <body className={`${interTight.className} antialiased`}>
        {children}
        
        {/* ChatbotWidget muncul di semua page */}
        <ChatbotWidget />
      </body>
    </html>
  );
}