"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Quote, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const Testimonials: React.FC = () => {
  const GOOGLE_PLACE_ID = "ChIJtxOArCHh1y0RBRJE2se0bjU";
  const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;

  const testimonials = [
    {
      name: "N. Maula",
      role: "Local Guide",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      text: "Bagus banget hasil fotonya jernih, murah, aksesoris dan propertinya sangat banyak untuk pendukung foto, tempatnya nyaman, bersih, sejuk, adminnya informatif, parkiran luas, lokasinya juga sangat strategis di pusat kotaa. bakal balik kesini lagi kalau foto. thx",
      rating: 5,
    },
    {
      name: "Z. Naura",
      role: "Local Guide",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      text: "kalian kalo bingung foto self studio dimana atau mau sama temn temn keluarga dan pasangan kalian? ini seriuss rekomen bangett karnaa dengan harganya ramah dikantong, tempatnya bagus nyaman dan kameranya hd cerah juga trud pelayanannya ramah dan baik banget, kakanya gercep semua dan ditempatnya juga jualin berbagai jajanan sama minuman enak banget and worth to buyy gaiss, kalo ada bintang 10 aku kasi 10 bintang buat pama studio🤩🤩🤩🤩",
      rating: 5,
    },
    {
      name: "C. Sherlyna",
      role: "Local Guide",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      text: "Keren bgt , hospitality abang² nya juga ramah . Ada Snack sama minuman juga . Buat yang ga pede foto ada musik dlm studionya biar bisa lebih rileks . Ada tempat nongkinya jg adem , bisa smooking juga . Ohyaa parkirannya luas yaa barangkali mau bawa mbl / truk mah masuk aja",
      rating: 5,
    }
  ];

  const [active, setActive] = useState(0);

  return (
    <section className="relative bg-[#FBF7F1] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Side */}
          <div className="lg:col-span-4">
            <span
              className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8B1A1A]"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              — Testimoni
            </span>
            <h2
              className="mt-3 text-4xl leading-[1.05] text-[#1a0505] sm:text-5xl lg:text-[48px]"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}
            >
              Pengalaman<br />
              mereka di <span className="italic text-[#8B1A1A]">PAMA Studio</span>
            </h2>
            <p
              className="mt-5 max-w-sm text-sm text-[#3a1a1a]/70"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              Cerita tulus dari mereka yang pernah mempercayakan momennya pada
              kami.
            </p>

            {/* Google Review CTA Button */}
            <div className="mt-8">
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#8B1A1A] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#6B1212] hover:shadow-lg active:scale-95"
                style={{ fontFamily: "Inter Tight, sans-serif" }}
              >
                <Star className="h-4 w-4 fill-current text-[#FFD7A8]" />
                Tulis Ulasan di Google
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
              <p className="mt-3 text-[11px] text-[#3a1a1a]/40 italic">
                *Ulasan Anda akan langsung tampil di Google Maps kami
              </p>
            </div>

            <hr className="my-8 border-[#8B1A1A]/10" />

            {/* Featured avatar section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#8B1A1A]/20 blur-md" />
                <Image
                  src={testimonials[active].img}
                  alt={testimonials[active].name}
                  width={64}
                  height={64}
                  unoptimized
                  className="relative h-16 w-16 rounded-full border-2 border-white object-cover shadow-lg"
                />
              </div>
              <div>
                <div
                  className="text-base font-semibold text-[#1a0505]"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {testimonials[active].name}
                </div>
                <div
                  className="text-xs text-[#3a1a1a]/60"
                  style={{ fontFamily: "Inter Tight, sans-serif" }}
                >
                  {testimonials[active].role}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={() =>
                  setActive((a) => (a - 1 + testimonials.length) % testimonials.length)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8B1A1A]/20 text-[#8B1A1A] transition hover:bg-[#8B1A1A] hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setActive((a) => (a + 1) % testimonials.length)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8B1A1A]/20 text-[#8B1A1A] transition hover:bg-[#8B1A1A] hover:text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div
                className="ml-4 text-xs text-[#3a1a1a]/50"
                style={{ fontFamily: "Inter Tight, sans-serif" }}
              >
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(testimonials.length).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Right Side - Cards */}
          <div className="lg:col-span-8">
            <div className="space-y-3">
              {testimonials.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={[
                    "group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-500",
                    active === i
                      ? "border-transparent bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] shadow-[0_20px_40px_-20px_rgba(139,26,26,0.5)]"
                      : "border-[#8B1A1A]/15 bg-white hover:border-[#8B1A1A]/30",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-4">
                    <Image
                      src={t.img}
                      alt={t.name}
                      width={48}
                      height={48}
                      unoptimized
                      className={[
                        "h-12 w-12 shrink-0 rounded-full border-2 object-cover transition",
                        active === i ? "border-white" : "border-[#8B1A1A]/20",
                      ].join(" ")}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div
                            className={[
                              "text-sm font-semibold",
                              active === i ? "text-white" : "text-[#1a0505]",
                            ].join(" ")}
                            style={{ fontFamily: "Fraunces, serif" }}
                          >
                            {t.name}
                          </div>
                          <div
                            className={[
                              "text-[11px]",
                              active === i ? "text-white/70" : "text-[#3a1a1a]/50",
                            ].join(" ")}
                            style={{ fontFamily: "Inter Tight, sans-serif" }}
                          >
                            {t.role}
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(t.rating)].map((_, j) => (
                            <Star
                              key={j}
                              className={[
                                "h-3 w-3 fill-current",
                                active === i
                                  ? "text-[#FFD7A8]"
                                  : "text-[#8B1A1A]",
                              ].join(" ")}
                            />
                          ))}
                        </div>
                      </div>
                      <p
                        className={[
                          "mt-2 text-sm leading-relaxed",
                          active === i ? "text-white/90" : "text-[#3a1a1a]/75",
                        ].join(" ")}
                        style={{ fontFamily: "Inter Tight, sans-serif" }}
                      >
                        &ldquo;{t.text}&rdquo;
                      </p>
                    </div>
                    <Quote
                      className={[
                        "h-5 w-5 shrink-0 transition",
                        active === i ? "text-white/40" : "text-[#8B1A1A]/20",
                      ].join(" ")}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;