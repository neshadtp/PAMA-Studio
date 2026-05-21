"use client";

import { usePathname } from "next/navigation";
import ChatbotWidget from "./ChatbotWidget";

export default function ChatbotGuard() {
  const pathname = usePathname() ?? "";
  // Hide chatbot on admin and internal API routes. Show everywhere else,
  // including public pages and the user panel (`/dashboard-client`).
  // Use a strict check so any path that begins with `/admin` is excluded
  // (e.g. `/admin`, `/admin/analytics`, `/admin/pagemanagement`, etc.).
  const isAdmin = /^\/admin(\/|$)/.test(pathname);
  const isApi = /^\/api(\/|$)/.test(pathname);

  if (isAdmin || isApi) return null;

  return <ChatbotWidget />;
}
