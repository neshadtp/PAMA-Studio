'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/whatsapp';

type FlowiseChatbot = {
  init: (config: {
    chatflowid: string;
    apiHost: string;
    theme: Record<string, unknown>;
  }) => void;
};

const ChatbotWidget = () => {
  const [isError, setIsError] = useState(false);
  const pathname = usePathname();
  const FLOWISE_CHATFLOW_ID = process.env.NEXT_PUBLIC_FLOWISE_CHATFLOW_ID;
  const FLOWISE_API_HOST = process.env.NEXT_PUBLIC_FLOWISE_API_HOST;

  // Only show chatbot on public pages and user panel
  const allowedPaths = ['/', '/paket', '/dashboard-client'];
  const isAllowedPath = allowedPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  if (!isAllowedPath) {
    return null;
  }

  return (
    <>
      <Script
      src="https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
      type="module"
      strategy="afterInteractive"
      onLoad={() => {
        const bot = (window as Window & { Chatbot?: FlowiseChatbot }).Chatbot;

        if (!bot) {
          console.error("Terjadi kesalahan, hubungi admin.");
          return;
        }

        if (!FLOWISE_CHATFLOW_ID || !FLOWISE_API_HOST) {
          console.error("Terjadi kesalahan, hubungi admin.");
          console.error("NEXT_PUBLIC_FLOWISE_CHATFLOW_ID:", FLOWISE_CHATFLOW_ID);
          console.error("NEXT_PUBLIC_FLOWISE_API_HOST:", FLOWISE_API_HOST);
          return;
        }

        try {
          bot.init({
            chatflowid: FLOWISE_CHATFLOW_ID,
            apiHost: FLOWISE_API_HOST.replace(/\/$/, ""),
            theme: {
              button: {
                backgroundColor: "#8B1A1A",
                right: 25,
                bottom: 25,
                size: "large",
                dragAndDrop: true,
                iconColor: "#ffffff",
              },
              tooltip: {
                showTooltip: true,
                tooltipMessage: "Ada yang bisa dibantu? 👋",
                tooltipBackgroundColor: "#8B1A1A",
                tooltipTextColor: "#ffffff",
                fontSize: 14,
              },
              chatWindow: {
                showTitle: true,
                title: "PAMA Assistant",
                titleAvatarSrc: "/logo.png",
                showAgentMessages: true,
                welcomeMessage: "Halo Kak! 👋 Selamat datang di **PAMA Studio**. Saya asisten digital Anda. Ada yang bisa saya bantu terkait informasi paket atau cara booking hari ini? ✨",
                errorMessage: "Maaf, terjadi kendala teknis. Silakan coba lagi nanti.",
                backgroundColor: "#FBF7F1",
                height: 600,
                width: 400,
                fontSize: 15,
                fontFamily: "'Inter Tight', sans-serif",
                botMessage: {
                  backgroundColor: "#ffffff",
                  textColor: "#1a0505",
                  showAvatar: true,
                  avatarSrc: "/logo.png",
                },
                userMessage: {
                  backgroundColor: "#8B1A1A",
                  textColor: "#ffffff",
                  showAvatar: false,
                },
                textInput: {
                  placeholder: "Ketik pesan Anda di sini...",
                  backgroundColor: "#ffffff",
                  textColor: "#1a0505",
                  sendButtonColor: "#8B1A1A",
                  maxChars: 200,
                  maxCharsWarningMessage: "Pesan terlalu panjang. Maksimal 200 karakter.",
                  autoFocus: true,
                },
                feedback: {
                  color: "#8B1A1A",
                },
                footer: {
                  textColor: "#3a1a1a",
                  text: "PAMA Studio Assistant by",
                },
                starterPrompts: [
                  "📷 Lihat Pilihan Paket",
                  "📅 Cara Booking Jadwal",
                  "📍 Lokasi & Jam Operasional",
                ],
              },
            },
          });

          console.log("PAMA Studio Assistant Initialized with Premium UI!");
        } catch (error) {
          console.error("Terjadi kesalahan, hubungi admin.", error);
          setIsError(true);
        }
      }}
      onError={(error) => {
        console.error('Terjadi kesalahan, hubungi admin.', error);
        setIsError(true);
      }}
    />
    {isError && (
      <a
        href={buildWhatsAppLink("Halo, saya butuh bantuan dari PAMA Studio.")}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[25px] right-[25px] z-[9999] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 active:scale-95"
        title="Hubungi Admin via WhatsApp"
      >
        <MessageCircle size={32} />
        <span className="absolute -left-32 top-1/2 -translate-y-1/2 rounded-lg bg-[#8B1A1A] px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 sm:block hidden">
          Chat Admin
        </span>
      </a>
    )}
    </>
  );
};

export default ChatbotWidget;
