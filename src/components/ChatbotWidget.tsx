'use client';

import Script from 'next/script';

const ChatbotWidget = () => {
  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
      type="module"
      strategy="afterInteractive"
      onLoad={() => {
        // Pake 'as any' biar TS diem & aman pas runtime
        const bot = (window as any).Chatbot;
        if (bot) {
          bot.init({
            chatflowid: "ID-CHATFLOW-LU-GANTI-DI-SINI", 
            apiHost: "http://localhost:3000",
            theme: {
              button: {
                backgroundColor: "#D8E2DC", // Sage Green Pastel
                right: 25,
                bottom: 25,
                size: "large",
                zIndex: 9999,
              },
              chatWindow: {
                title: "PAMA Assistant",
                welcomeMessage: "Halo! Ada yang bisa kami bantu di PAMA Studio?",
                backgroundColor: "#FAF9F6",
                fontSize: 16,
                botMessage: {
                  backgroundColor: "#ECE4DB",
                  textColor: "#303235",
                },
                userMessage: {
                  backgroundColor: "#D8E2DC",
                  textColor: "#303235",
                },
                textInput: {
                  placeholder: "Tanya paket atau jadwal...",
                  backgroundColor: "#ffffff",
                  sendButtonColor: "#D8E2DC",
                }
              }
            }
          });
        }
      }}
    />
  );
};

export default ChatbotWidget;