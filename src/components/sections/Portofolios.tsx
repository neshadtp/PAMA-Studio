"use client";

import React from "react";
import Image from "next/image";

const Portfolio: React.FC = () => {
  const row1 = [
    "/images/foto4.jpg",
    "/images/foto1.jpg",
    "/images/foto2.jpg",
    "/images/foto3.jpg",
    "/images/foto5.jpg",
    "/images/foto6.jpg",
  ];
  const row2 = [
    "/images/foto7.jpg",
    "/images/foto8.jpg",
    "/images/foto9.jpg",
    "/images/foto10.jpg",
    "/images/foto11.jpg",
    "/images/foto12.jpg",
  ];

  return (
    <section id="portofolio" className="relative bg-[#FBF7F1] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <span
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8B1A1A]"
            style={{ fontFamily: "Inter Tight, sans-serif" }}
          >
            — Our work
          </span>
          <h2
            className="mt-3 text-4xl text-[#1a0505] sm:text-5xl lg:text-[58px]"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}
          >
            Porto<span className="italic text-[#8B1A1A]">folio</span>
          </h2>
          <p
            className="mt-4 max-w-xl text-sm text-[#3a1a1a]/70 lg:text-base"
            style={{ fontFamily: "Inter Tight, sans-serif" }}
          >
            Kumpulan sesi terpilih yang membawa karakter, emosi, dan cerita
            setiap klien kami.
          </p>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="relative mt-12 space-y-5 overflow-hidden">
        {/* gradient edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#FBF7F1] to-transparent sm:w-32" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#FBF7F1] to-transparent sm:w-32" />

        {/* Row 1 — scrolls left */}
        <div className="group flex gap-5 overflow-hidden">
          <div className="flex shrink-0 animate-[marqueeLeft_45s_linear_infinite] gap-5 group-hover:[animation-play-state:paused]">
            {[...row1, ...row1].map((src, i) => (
              <div
                key={`r1-${i}`}
                className="relative h-64 w-48 shrink-0 overflow-hidden rounded-2xl shadow-md sm:h-80 sm:w-60"
              >
                <Image
                  src={src}
                  alt={`Portfolio ${i}`}
                  fill
                  unoptimized
                  className="object-cover transition duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="group flex gap-5 overflow-hidden">
          <div className="flex shrink-0 animate-[marqueeRight_50s_linear_infinite] gap-5 group-hover:[animation-play-state:paused]">
            {[...row2, ...row2].map((src, i) => (
              <div
                key={`r2-${i}`}
                className="relative h-64 w-48 shrink-0 overflow-hidden rounded-2xl shadow-md sm:h-80 sm:w-60"
              >
                <Image
                  src={src}
                  alt={`Portfolio ${i}`}
                  fill
                  unoptimized
                  className="object-cover transition duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee keyframes */}
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
};

export default Portfolio;