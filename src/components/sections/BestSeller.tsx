"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const BestSeller: React.FC = () => {
  const { ref: headerRef, inView: headerVisible } = useInView({ threshold: 0.2 });
  const { ref: cardsRef, inView: cardsVisible } = useInView({ threshold: 0.1 });

  const packages = [
    {
      name: "",
      price: "Pas Foto",
      tag: "Paling Populer",
      features: ["1 Orang", "30 menit sesi", "15 foto edit", "2 wardrobe"],
      img: "/images/pasfoto.jpg",
    },
    {
      name: "",
      price: "Duo - Self Photo Studio 1",
      tag: "Favorit Couple",
      features: ["1-2 Orang", "10 menit sesi", "1 Print 4R"],
      img: "/images/duo.jpg",
      featured: true,
    },
    {
      name: "",
      price: "Basic - Self Photo Studio 1",
      tag: "Terlaris Grup",
      features: ["1-3 Orang", "15 menit sesi", "1 Print 4R"],
      img: "/images/basic.jpg",
    },
  ];

  return (
    <section
      id="paket"
      className="relative overflow-hidden bg-gradient-to-br from-[#8B1A1A] via-[#761414] to-[#5C0E0E] py-16 lg:py-24"
    >
      {/* subtle dots */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div
          ref={headerRef}
          className="grid items-end gap-8 lg:grid-cols-12"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="lg:col-span-8">
            <span
              className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FFD7A8]"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              — Best Seller
            </span>
            <h2
              className="mt-3 text-4xl leading-[1.05] text-white sm:text-5xl lg:text-[58px]"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}
            >
              Paket <span className="italic">favorit</span>
              <br />
              para pelanggan kami.
            </h2>
            <p
              className="mt-4 max-w-xl text-sm text-white/70 lg:text-base"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              Dipilih paling banyak karena memberikan hasil foto terbaik dengan
              harga yang tetap terjangkau. Cocok untuk kamu yang ingin tampil
              maksimal tanpa ribet.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <a
              href="/paket"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-[#8B1A1A] transition hover:bg-[#FFD7A8]"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              Pilih Paket
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* Cards */}
<div
  ref={cardsRef}
  className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-end"
>
  {packages.map((p, i) => (
    <div
      key={i}
className={[
  "group relative overflow-hidden rounded-[28px] h-full flex flex-col justify-between transform-gpu transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:scale-[1.015] hover:shadow-[0_24px_50px_-18px_rgba(0,0,0,0.22)]",
  p.featured
    ? "bg-[#FBF7F1]"
    : "bg-white/95",
].join(" ")}
      style={{
        opacity: cardsVisible ? 1 : 0,
        transform: cardsVisible
  ? "translateY(0) scale(1) rotateX(0deg)"
  : "translateY(80px) scale(0.92) rotateX(6deg)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${
          0.15 + i * 0.18
        }s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${
          0.15 + i * 0.18
        }s`,
      }}
    >
              {/* Shimmer overlay on hover */}
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ transform: "skewX(-20deg) translateX(-100%)", animation: cardsVisible ? undefined : "none" }}
              />

              {/* image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  unoptimized
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                {/* Tag */}
                <div
                  className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8B1A1A] backdrop-blur-md"
                  style={{ fontFamily: "Inter Tight, sans-serif" }}
                >
                  {p.tag}
                </div>

                {/* Price badge */}
                {p.featured && (
                  <div
                    className="absolute right-4 top-4 rounded-full bg-[#8B1A1A] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white"
                    style={{ fontFamily: "Inter Tight, sans-serif" }}
                  >
                    Pilihan Kami
                  </div>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3
                    className="text-2xl text-white"
                    style={{ fontFamily: "Fraunces, serif", fontWeight: 500 }}
                  >
                    {p.name}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <div
                     className="min-h-[96px] text-3xl font-semibold text-[#1a0505] leading-tight"
                      style={{ fontFamily: "Fraunces, serif" }}
                  >
                      {p.price}
                  </div>
                  <div
                    className="text-[11px] uppercase tracking-wider text-[#3a1a1a]/50"
                    style={{ fontFamily: "Inter Tight, sans-serif" }}
                  >
                    / sesi
                  </div>
                </div>

                <ul
                  className="mt-5 space-y-2.5"
                  style={{ fontFamily: "Inter Tight, sans-serif" }}
                >
                  {p.features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2.5 text-sm text-[#3a1a1a]/80"
                      style={{
                        opacity: cardsVisible ? 1 : 0,
                        transform: cardsVisible ? "translateX(0)" : "translateX(-15px)",
                        transition: `opacity 0.5s ease ${0.5 + i * 0.18 + j * 0.06}s, transform 0.5s ease ${0.5 + i * 0.18 + j * 0.06}s`,
                      }}
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#8B1A1A]/10 text-[#8B1A1A]">
                        <svg
                          className="h-2.5 w-2.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                          />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSeller;