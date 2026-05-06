"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden text-white">
      {/* Curved wave SVG top */}
      <div className="relative -mb-1">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C240,100 480,0 720,60 C960,120 1200,20 1440,80 L1440,120 L0,120 Z"
            fill="#5C0E0E"
          />
          <path
            d="M0,60 C200,110 440,10 720,70 C1000,130 1240,30 1440,90 L1440,120 L0,120 Z"
            fill="#4a0a0a"
            opacity="0.7"
          />
          <path
            d="M0,80 C180,110 400,40 720,80 C1040,120 1260,50 1440,100 L1440,120 L0,120 Z"
            fill="#2a0505"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Main footer body */}
      <div className="bg-gradient-to-br from-[#5C0E0E] via-[#4a0a0a] to-[#2a0505]">
        {/* Decorative dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow atas */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#8B1A1A]/40 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">

            {/* ── Brand ── */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-white/10 blur-sm" />
                  <div className="relative h-full w-full overflow-hidden rounded-full border border-white/20 bg-[#ffffff]">
                    <Image
                      src="/logo.png"
                      alt="Logo PAMA Studio"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                </div>
                <div>
                  <div
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    PAMA Studio
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-[0.22em] text-white/50"
                    style={{ fontFamily: "Inter Tight, sans-serif" }}
                  >
                    Self Photo Studio
                  </div>
                </div>
              </div>

              <p
                className="mt-5 text-sm leading-relaxed text-white/55"
                style={{ fontFamily: "Inter Tight, sans-serif" }}
              >
                Dengan melakukan booking di Pama Studio, Anda menyetujui Kebijakan
                Privasi kami. Foto tidak akan dipublikasikan tanpa persetujuan
                customer. Pembatalan maksimal 3 jam sebelum jadwal.
              </p>
            </div>

            {/* ── Info ── */}
            <div style={{ fontFamily: "Inter Tight, sans-serif" }}>
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Info
              </div>
              <div className="mt-1 mb-4 h-px w-8 bg-[#FFD7A8]/40" />
              <ul className="space-y-3 text-sm text-white/55">
                {["FAQ & Bantuan", "Syarat & Ketentuan", "Kebijakan Privasi", "Metode Pembayaran"].map((item) => (
                  <li key={item}>
                    <a href="#" className="transition-colors duration-150 hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Pages ── */}
            <div style={{ fontFamily: "Inter Tight, sans-serif" }}>
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Pages
              </div>
              <div className="mt-1 mb-4 h-px w-8 bg-[#FFD7A8]/40" />
              <ul className="space-y-3 text-sm text-white/55">
                {[
                  { label: "Tentang Kami", href: "#beranda" },
                  { label: "Portofolio", href: "#portofolio" },
                  { label: "Paket & Harga", href: "#paket" },
                  { label: "Kontak", href: "#kontak" },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="transition-colors duration-150 hover:text-white">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Contact ── */}
            <div style={{ fontFamily: "Inter Tight, sans-serif" }}>
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Kontak
              </div>
              <div className="mt-1 mb-4 h-px w-8 bg-[#FFD7A8]/40" />
              <ul className="space-y-4 text-sm text-white/55">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD7A8]" />
                  <span>Sidoarjo, Jawa Timur</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD7A8]" />
                  <a href="mailto:pamastudio.id@gmail.com" className="transition-colors hover:text-white">
                    pamastudio.id@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD7A8]" />
                  <a href="tel:+6282331555431" className="transition-colors hover:text-white">
                    +62 823-3155-5431
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div
            className="mt-14 flex flex-col items-center justify-center gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row"
            style={{ fontFamily: "Inter Tight, sans-serif" }}
          >
            <div className="text-sm">© Februari 2023 PAMA Studio. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;