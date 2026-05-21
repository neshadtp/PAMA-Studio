"use client";

import Image from "next/image";
import { useInView } from "@/hooks/useInView";

const row1 = [
  "/images/foto4.webp",
  "/images/foto1.webp",
  "/images/foto2.webp",
  "/images/foto3.webp",
  "/images/foto5.webp",
  "/images/foto6.webp",
];

const row2 = [
  "/images/foto7.webp",
  "/images/foto8.webp",
  "/images/foto9.webp",
  "/images/foto10.webp",
  "/images/foto11.webp",
  "/images/foto12.webp",
];

export default function Portfolio() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: false });

  return (
    <section
      id="portofolio"
      ref={ref}
      className="relative bg-[#FBF7F1] py-16 lg:py-24"
    >
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

      <div className="relative mt-12 space-y-5 overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#FBF7F1] to-transparent sm:w-32" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#FBF7F1] to-transparent sm:w-32" />

        <div className="group flex gap-5 overflow-hidden">
          <div
            className={[
              "flex shrink-0 gap-5 will-change-transform",
              inView
                ? "animate-none md:animate-[marqueeLeft_45s_linear_infinite]"
                : "animate-none md:animate-none",
              "group-hover:[animation-play-state:paused]",
            ].join(" ")}
          >
            {[...row1, ...row1].map((src, i) => (
              <div
                key={`r1-${i}`}
                className="relative h-64 w-48 shrink-0 overflow-hidden rounded-2xl shadow-md sm:h-80 sm:w-60 motion-reduce:animate-none"
                style={{ contain: "layout paint size" }}
              >
                <Image
                  src={src}
                  alt={`Portfolio ${i}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 192px, 240px"
                  className="object-cover transition duration-500 will-change-transform hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="group flex gap-5 overflow-hidden">
          <div
            className={[
              "flex shrink-0 gap-5 will-change-transform",
              inView
                ? "animate-none md:animate-[marqueeRight_50s_linear_infinite]"
                : "animate-none md:animate-none",
              "group-hover:[animation-play-state:paused]",
            ].join(" ")}
          >
            {[...row2, ...row2].map((src, i) => (
              <div
                key={`r2-${i}`}
                className="relative h-64 w-48 shrink-0 overflow-hidden rounded-2xl shadow-md sm:h-80 sm:w-60 motion-reduce:animate-none"
                style={{ contain: "layout paint size" }}
              >
                <Image
                  src={src}
                  alt={`Portfolio ${i}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 192px, 240px"
                  className="object-cover transition duration-500 will-change-transform hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

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
}
