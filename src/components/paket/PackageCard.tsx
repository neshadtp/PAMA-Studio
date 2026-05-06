"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Eye, ArrowRight, Check, Sparkles } from "lucide-react";
import { useInView } from "@/hooks/useInView"; // Sesuaikan path
import GalleryModal from "./GalleryModal";

/* ── Types ── */
export interface SubPackage { name: string; description: string; price: string; }
export interface AdditionalItem { name: string; price: string; }
export interface PackageData {
  id: string; title: string; subtitle: string; description: string;
  image: string; galleryImages: string[]; subPackages: SubPackage[];
  additionals?: AdditionalItem[]; features?: string[];
  ctaLabel: string; ctaLink: string; accent?: "maroon" | "dark" | "warm";
}

const PackageCard: React.FC<{ data: PackageData; index: number }> = ({ data, index }) => {
  const [accordionOpen, setAccordionOpen] = useState(false); // Default open di Desktop
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.08 });

  const isEven = index % 2 === 0;

  return (
    <>
      <div
        ref={ref}
        className="relative w-full"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(60px)",
          transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s`,
        }}
      >
        <div className={`group flex flex-col overflow-hidden rounded-[32px] border border-[#8B1A1A]/10 bg-white shadow-[0_20px_60px_-20px_rgba(90,15,15,0.15)] transition-all duration-500 hover:shadow-[0_30px_80px_-20px_rgba(90,15,15,0.25)] ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
          
          {/* ── Kiri: Gambar (Di Laptop) ── */}
          <div className="relative w-full lg:w-5/12 shrink-0">
            <div className="relative aspect-[4/3] w-full h-full min-h-[300px] lg:min-h-full overflow-hidden">
              <Image
                src={data.image}
                alt={data.title}
                fill
                unoptimized
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0505]/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#1a0505]/10" />
              
              <div className="absolute left-6 top-6 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-md" style={{ fontFamily: "Inter Tight, sans-serif" }}>
                <Sparkles className="h-3.5 w-3.5 text-[#8B1A1A]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1a0505]">{data.subtitle}</span>
              </div>
            </div>
          </div>

          {/* ── Kanan: Area Konten Utama ── */}
          <div className="flex w-full flex-col p-6 sm:p-8 lg:w-7/12 lg:p-10">
            {/* Header Konten */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-3xl text-[#1a0505] sm:text-4xl lg:text-[42px]" style={{ fontFamily: "Fraunces, serif", fontWeight: 500 }}>
                  {data.title}
                </h3>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#3a1a1a]/70 lg:text-[15px]" style={{ fontFamily: "Inter Tight, sans-serif" }}>
                  {data.description}
                </p>
              </div>
              
              <button
                onClick={() => setGalleryOpen(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#8B1A1A] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#6B1212] hover:shadow-lg"
                style={{ fontFamily: "Inter Tight, sans-serif" }}
              >
                <Eye className="h-4 w-4" /> View Gallery
              </button>
            </div>

            {/* Fitur (Jika Ada) */}
            {data.features && data.features.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[#8B1A1A]/10 bg-[#FBF7F1] p-5" style={{ fontFamily: "Inter Tight, sans-serif" }}>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.features.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-[#3a1a1a]/80">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#8B1A1A]/10 text-[#8B1A1A]">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Layout Bersebelahan: Sub Paket & Additional ── */}
            <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2 flex-1">
              
              {/* Kolom Kiri: Sub Paket */}
              {data.subPackages.length > 0 && (
                <div className="flex flex-col">
                  <button onClick={() => setAccordionOpen(!accordionOpen)} className="flex h-[52px] w-full items-center justify-between border-b border-[#8B1A1A]/10">
                    <span className="text-lg font-semibold text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>Pilihan Paket</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8B1A1A]/20 text-[#8B1A1A] transition hover:bg-[#8B1A1A]/5">
                      {accordionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ maxHeight: accordionOpen ? "1000px" : "0px", opacity: accordionOpen ? 1 : 0 }}>
                    <div className="mt-4 space-y-3">
                      {data.subPackages.map((sub, si) => (
                        <div key={si} className="flex items-center justify-between rounded-xl border border-[#8B1A1A]/8 bg-gradient-to-r from-[#FBF7F1] to-[#FFF8E7] p-3.5 transition hover:border-[#8B1A1A]/20">
                          <div>
                            <h4 className="text-sm font-semibold text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>{sub.name}</h4>
                            <p className="mt-0.5 text-[11px] text-[#3a1a1a]/60 leading-tight" style={{ fontFamily: "Inter Tight, sans-serif" }}>{sub.description}</p>
                          </div>
                          <div className="ml-3 shrink-0 text-right text-[15px] font-semibold text-[#8B1A1A]" style={{ fontFamily: "Fraunces, serif" }}>
                            {sub.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Kolom Kanan: Additional & CTA */}
              <div className="flex flex-col justify-between h-full space-y-6">
  {data.additionals && data.additionals.length > 0 && (
    <div>
      <h4 className="flex h-[52px] items-center text-xs font-semibold uppercase tracking-[0.15em] text-[#8B1A1A] border-b border-[#8B1A1A]/10">
        Layanan Additional
      </h4>
      <div
        className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ maxHeight: accordionOpen ? "1000px" : "0px", opacity: accordionOpen ? 1 : 0 }}
      >
        <div className="mt-4 space-y-2">
          {data.additionals.map((add, ai) => (
            <div key={ai} className="flex items-center justify-between rounded-xl bg-[#8B1A1A]/5 px-3.5 py-2.5 transition hover:bg-[#8B1A1A]/10">
              <span className="text-[13px] font-medium text-[#1a0505]" style={{ fontFamily: "Inter Tight, sans-serif" }}>{add.name}</span>
              <span className="text-[13px] font-bold text-[#8B1A1A]" style={{ fontFamily: "Fraunces, serif" }}>{add.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

                {/* Tombol CTA selalu berada di ujung bawah kanan */}
                <div className="mt-auto pt-4">
                  <Link
                    href={data.ctaLink}
                    className="group/btn flex w-full items-center justify-center gap-2.5 rounded-full bg-[#8B1A1A] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#6B1212] hover:shadow-[0_10px_30px_-10px_rgba(139,26,26,0.5)]"
                    style={{ fontFamily: "Inter Tight, sans-serif" }}
                  >
                    {data.ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <GalleryModal isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} images={data.galleryImages} title={data.title} />
    </>
  );
};

export default PackageCard;