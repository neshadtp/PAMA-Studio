"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Camera, Sparkles } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-[#FBF7F1] pt-32 pb-16 lg:pt-40 lg:pb-24"
    >
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#8B1A1A]/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-[#D4A373]/20 blur-[100px]" />

      {/* Subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Text */}
          <div className="lg:col-span-7 lg:pt-6">
            {/* Tag */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-[#8B1A1A]/20 bg-white/60 px-4 py-1.5 backdrop-blur-sm"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8B1A1A] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8B1A1A]" />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#8B1A1A]">
                Studio foto profesional sejak 2023
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mt-6 text-[44px] leading-[1.02] text-[#1a0505] sm:text-[60px] lg:text-[84px]"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}
            >
              Abadikan versi{" "}
              <span className="italic font-light text-[#8B1A1A]">
                terbaikmu
              </span>
              <br />
              dengan <span className="font-semibold">mudah.</span>
            </h1>

            <p
              className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#3a1a1a]/75 lg:text-base"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              Pencahayaan studio yang dirancang khusus, arahan pose dari tim
              fotografer berpengalaman, dan hasil edit rapi yang mengangkat
              karaktermu — semua dalam satu sesi yang nyaman di PAMA Studio.
            </p>

            {/* CTAs */}
            <div
              className="mt-8 flex flex-wrap items-center gap-3"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              <a
                href="#paket"
                className="group inline-flex items-center gap-2 rounded-full bg-[#8B1A1A] px-6 py-3.5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(139,26,26,0.6)] transition hover:bg-[#6B1212] hover:shadow-[0_14px_36px_-10px_rgba(139,26,26,0.8)]"
              >
                Selengkapnya
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#portofolio"
                className="group inline-flex items-center gap-2 rounded-full border border-[#8B1A1A]/30 bg-white/60 px-6 py-3.5 text-sm font-medium text-[#8B1A1A] backdrop-blur-sm transition hover:bg-white"
              >
                Lihat Portofolio
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Image collage */}
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_30px_80px_-30px_rgba(90,15,15,0.5)]">
              <Image
                src="/images/hero.jpg"
                alt="PAMA Studio hero"
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0505]/25 via-transparent to-transparent" />

              {/* Floating badge */}
              <div
                className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-md"
                style={{ fontFamily: "Inter Tight, sans-serif" }}
              >
                <Camera className="h-3.5 w-3.5 text-[#8B1A1A]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1a0505]">
                  Studio Pro
                </span>
              </div>
            </div>

            {/* Floating card */}
            <div
              className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-white bg-white/90 p-4 shadow-xl backdrop-blur-md sm:block"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A1A]/10 text-[#8B1A1A]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div
                    className="text-sm font-semibold text-[#1a0505]"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    Hasil Premium
                  </div>
                  <div className="text-[11px] text-[#3a1a1a]/60">
                    Edit rapi, siap upload
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;