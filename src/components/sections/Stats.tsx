"use client";

import React from "react";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";

interface StatItemProps {
  end: number;
  suffix: string;
  label: string;
  inView: boolean;
  hasBorder: boolean;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ end, suffix, label, inView, hasBorder, delay }) => {
  const count = useCountUp(end, inView, 2200);

  return (
    <div
      className={[
        "flex flex-col items-center text-center",
        hasBorder ? "lg:border-r lg:border-white/20" : "",
      ].join(" ")}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      <div
        className="text-5xl font-semibold text-white sm:text-6xl lg:text-7xl"
        style={{ fontFamily: "Fraunces, serif" }}
      >
        {inView ? count.toLocaleString() : "0"}
        <span>{suffix}</span>
      </div>
      <div
        className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-white/70"
        style={{ fontFamily: "Inter Tight, sans-serif" }}
      >
        {label}
      </div>
    </div>
  );
};

const Stats: React.FC = () => {
  const { ref, inView } = useInView({ threshold: 0.3 });

  const stats = [
    { end: 500, suffix: "+", label: "Sesi Foto" },
    { end: 500, suffix: "K+", label: "Frame Diabadikan" },
    { end: 98, suffix: "%", label: "Tingkat Kepuasan" },
    { end: 1000, suffix: "+", label: "Klien Bahagia" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#8B1A1A] via-[#761414] to-[#5C0E0E] py-14">
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div ref={ref} className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatItem
              key={i}
              end={s.end}
              suffix={s.suffix}
              label={s.label}
              inView={inView}
              hasBorder={i < 3}
              delay={i * 0.12}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;