"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CheckoutContent from "./CheckoutContent";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#FBF7F1] text-[#1a0505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B1A1A]" />
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}