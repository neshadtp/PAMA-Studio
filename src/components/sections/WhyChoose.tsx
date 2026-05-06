"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Camera, Wand2, HeartHandshake } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const WhyChoose: React.FC = () => {
  const { ref: sectionRef, inView: sectionVisible } = useInView({ threshold: 0.1 });
  const { ref: cardsRef, inView: cardsVisible } = useInView({ threshold: 0.15 });

  const features = [
    {
      icon: <Sparkles className="h-5 w-5" strokeWidth={1.75} />,
      title: "Lighting Profesional",
      desc: "Setup pencahayaan studio yang bersih, lembut, dan dikurasi untuk setiap bentuk wajah.",
    },
    {
      icon: <Camera className="h-5 w-5" strokeWidth={1.75} />,
      title: "Arahan Pose",
      desc: "Tim fotografer aktif memandu pose agar kamu tetap rileks dan natural di depan kamera.",
    },
    {
      icon: <Wand2 className="h-5 w-5" strokeWidth={1.75} />,
      title: "Edit Rapi & Natural",
      desc: "Retouching halus yang menjaga karakter asli — bukan filter berlebih, tapi versi terbaikmu.",
    },
    {
      icon: <HeartHandshake className="h-5 w-5" strokeWidth={1.75} />,
      title: "Pelayanan Nyaman",
      desc: "Suasana studio yang hangat, tim yang ramah, dan proses yang tidak terasa terburu-buru.",
    },
  ];

  return (
    <section className="relative bg-[#FBF7F1] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Top row: image + text */}
        <div ref={sectionRef} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div
            className="lg:col-span-5"
            style={{
              opacity: sectionVisible ? 1 : 0,
              transform: sectionVisible ? "translateX(0)" : "translateX(-60px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-[0_30px_80px_-30px_rgba(90,15,15,0.4)]">
              <Image
                src="/images/foto-pama.jpg"
                alt="PAMA team"
                fill
                unoptimized
                className="object-cover"
              />
              <div
                className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8B1A1A] backdrop-blur-md"
                style={{ fontFamily: "Inter Tight, sans-serif" }}
              >
                Since 2023
              </div>
            </div>
          </div>

          <div
            className="lg:col-span-7 lg:pl-6"
            style={{
              opacity: sectionVisible ? 1 : 0,
              transform: sectionVisible ? "translateX(0)" : "translateX(60px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s",
            }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8B1A1A]"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              — Mengapa Kami
            </span>
            <h2
              className="mt-3 text-4xl leading-[1.05] text-[#1a0505] sm:text-5xl lg:text-[54px]"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}
            >
              Kenapa pilih{" "}
              <span className="italic text-[#8B1A1A]">PAMA Studio?</span>
            </h2>
            <p
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#3a1a1a]/75"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              Berdiri sejak 2023, PAMA Studio hadir membawa layanan fotografi
              yang matang dan profesional. Kami merangkai setiap momen dengan
              hasil yang estetik, detail yang dipikirkan, dan pelayanan yang
              membuat siapa pun nyaman — dari pertama kali masuk studio sampai
              menerima file akhir.
            </p>
          </div>
        </div>

        {/* Feature cards */}
        <div ref={cardsRef} className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-[#8B1A1A]/10 bg-gradient-to-br from-[#FFF8E7] to-[#FDEFD0] p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(139,26,26,0.3)]"
              style={{
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
              }}
            >
              {/* Accent circle */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#8B1A1A]/5 transition-all duration-500 group-hover:scale-150" />

              {/* Number */}
              <div
                className="absolute right-5 top-5 text-xs font-semibold text-[#8B1A1A]/40"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                0{i + 1}
              </div>

              <div className="relative">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#8B1A1A] text-white shadow-md">
                  {f.icon}
                </div>
                <h3
                  className="mt-5 text-lg font-semibold text-[#1a0505]"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {f.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed text-[#3a1a1a]/70"
                  style={{ fontFamily: "Inter Tight, sans-serif" }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;