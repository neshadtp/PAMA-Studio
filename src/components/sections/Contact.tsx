"use client";

import React from "react";
import { MapPin, Phone, Mail, Music2, Camera, ArrowUpRight } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <section id="kontak" className="relative bg-[#FBF7F1]">
      {/* Banner */}
      <div className="bg-[#8B1A1A] py-5">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2
            className="text-center text-2xl text-white sm:text-3xl"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}
          >
            Temukan Kami di Sini
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left - Title + Map */}
          <div className="lg:col-span-7">
            <span
              className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8B1A1A]"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              — Contact Us
            </span>
            <h3
              className="mt-3 text-4xl leading-[1.05] text-[#1a0505] sm:text-5xl"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}
            >
              Mari <span className="italic text-[#8B1A1A]">terhubung</span>
            </h3>
            <p
              className="mt-4 max-w-lg text-sm text-[#3a1a1a]/70"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              Mampir langsung ke studio atau kirim pesan — tim kami akan membantu
              merencanakan sesi foto yang tepat untukmu.
            </p>

            {/* Embedded map */}
            <div className="mt-8 overflow-hidden rounded-[28px] border border-[#8B1A1A]/10 shadow-[0_20px_60px_-20px_rgba(90,15,15,0.3)]">
              <iframe
                title="PAMA Studio Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.13539456903!2d112.6882384750016!3d-7.450269492560941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7e121ac8013b7%3A0x356eb4c7da441205!2sPama%20Studio!5e0!3m2!1sid!2sid!4v1776313990758!5m2!1sid!2sid"
                width="100%"
                height="360"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right - Contact info */}
          <div className="lg:col-span-5">
            <h4
              className="text-2xl text-[#1a0505] sm:text-3xl"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 500 }}
            >
              Lokasi Kami
            </h4>

            <div
              className="mt-6 space-y-3"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              {[
                {
                  icon: <MapPin className="h-4 w-4" />,
                  label: "Alamat Studio",
                  value: "Pama Studio (self photo studio) berlokasi di Jl. Benda, Banjarbendo, Kec. Sidoarjo, Kabupaten Sidoarjo, Jawa Timur. ",
                  link: "https://maps.app.goo.gl/7a3H1UGnxbmnFJmR7"
                },
                {
                  icon: <Mail className="h-4 w-4" />,
                  label: "Email",
                  value: "pamastudio.id@gmail.com",
                  link: "mailto:pamastudio.id@gmail.com"
                },
                {
                  icon: <Phone className="h-4 w-4" />,
                  label: "WhatsApp",
                  value: "+62 823-3155-5431",
                  link: "https://wa.me/6282331555431"
                },
                {
                  icon: <Music2 className="h-4 w-4" />,
                  label: "TikTok",
                  value: "@Pama_studio",
                  link: "https://www.tiktok.com/@pama_studio"
                },
                {
                  icon: <Camera className="h-4 w-4" />,
                  label: "Instagram",
                  value: "@pamastudio.id",
                  link: "https://www.instagram.com/pamastudio.id/"
                },
              ].map((c, i) => (
                <a
                  key={i}
                  href={c.link}
                  className="group flex items-center justify-between rounded-2xl bg-gradient-to-br from-[#8B1A1A] to-[#6B1212] p-4 text-white shadow-[0_10px_30px_-15px_rgba(139,26,26,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-15px_rgba(139,26,26,0.8)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-white/60">
                        {c.label}
                      </div>
                      <div className="text-sm font-medium">{c.value}</div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>

            <a
              href="https://maps.app.goo.gl/7a3H1UGnxbmnFJmR7"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1a0505] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#8B1A1A]"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              <MapPin className="h-4 w-4" />
              Buka di Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;