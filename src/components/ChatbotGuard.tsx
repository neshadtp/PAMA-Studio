"use client";

import { usePathname } from "next/navigation";
import ChatbotWidget from "./ChatbotWidget";

export default function ChatbotGuard() {
  const pathname = usePathname() ?? "";
  const isAdmin = /^\/admin(\/|$)/.test(pathname);
  const isApi = /^\/api(\/|$)/.test(pathname);

  if (isAdmin || isApi) return null;

  return <ChatbotWidget />;
}
