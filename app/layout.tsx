import type { Metadata } from "next";
import { Inter_Tight, Fraunces } from "next/font/google";
import "./globals.css";
import ChatbotGuard from '../src/components/ChatbotGuard';
import { ToastProvider } from '@/contexts/ToastContext';

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
  metadataBase: new URL("https://pama-studio.vercel.app"),
  openGraph: {
    title: "PAMA Studio | Self Photo Studio",
    description: "Abadikan versi terbaikmu dengan mudah di PAMA Studio.",
    url: "https://pama-studio.vercel.app",
    siteName: "PAMA Studio",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PAMA Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PAMA Studio | Self Photo Studio",
    description: "Abadikan versi terbaikmu dengan mudah di PAMA Studio.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`scroll-smooth ${interTight.variable} ${fraunces.variable}`}>
      <body className={`${interTight.className} antialiased`}>
        <ToastProvider>
          {children}
          
          {/* Chatbot hanya muncul di public pages dan user panel saja */}
          <ChatbotGuard />
        </ToastProvider>
      </body>
    </html>
  );
}