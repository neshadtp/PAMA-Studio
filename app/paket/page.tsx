import React from "react";
import Link from "next/link";
import { Camera, Sparkles, Users, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PackageCard from "@/components/paket/PackageCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {  groupPackagesToCards } from "@/lib/packageCardAdapter";

type FilterKey =
  | "all"
  | "studio_1"
  | "studio_2"
  | "studio_2_molding"
  | "pas_foto"
  | "photographer";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "studio_1", label: "Self Photo Studio 1" },
  { key: "studio_2", label: "Self Photo Studio 2" },
  { key: "studio_2_molding", label: "Studio 2 Molding" },
  { key: "pas_foto", label: "Pas Foto" },
  { key: "photographer", label: "Jasa Fotografer" },
];

function PaketHeroSSR() {
  return (
    <section className="relative overflow-hidden bg-[#FBF7F1] pt-32 pb-10 lg:pt-40 lg:pb-16">
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#8B1A1A]/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 -left-32 h-[350px] w-[350px] rounded-full bg-[#D4A373]/15 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Link
          href="/"
          className="group mb-6 inline-flex items-center gap-2 rounded-full border border-[#8B1A1A]/20 bg-white/60 px-4 py-2 text-sm font-medium text-[#8B1A1A] backdrop-blur-sm transition hover:bg-white/80"
          style={{ fontFamily: "Inter Tight, sans-serif" }}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Beranda
        </Link>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8B1A1A]" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              — Pilihan Paket
            </span>
            <h1 className="mt-3 text-4xl leading-[1.05] text-[#1a0505] sm:text-5xl lg:text-[64px]" style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}>
              Pilih paket <span className="italic text-[#8B1A1A]">sesuai kebutuhanmu</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#3a1a1a]/70 lg:text-base" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              Booking self-photo & pas foto bisa pilih tanggal dan jam. Untuk jasa fotografer, jadwal disesuaikan admin.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Camera className="h-5 w-5" />, label: "Studio", count: "3" },
                { icon: <Users className="h-5 w-5" />, label: "Paket", count: "All" },
                { icon: <Sparkles className="h-5 w-5" />, label: "Fotografer", count: "Pro" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center rounded-2xl border border-[#8B1A1A]/10 bg-white/80 p-5 text-center backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B1A1A]/10 text-[#8B1A1A]">{s.icon}</div>
                  <div className="mt-3 text-2xl font-semibold text-[#1a0505]" style={{ fontFamily: "Fraunces, serif" }}>{s.count}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[#3a1a1a]/50" style={{ fontFamily: "Inter Tight, sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function buildFilterHref(filter: FilterKey, page: number) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/paket?${qs}` : "/paket";
}

export default async function PaketPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const filter = (sp.filter as FilterKey) ?? "all";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const pageSize = 4; // kamu bisa ubah: 3/4/5 sesuai taste

  const supabase = await createSupabaseServerClient();

  // base query
  let q = supabase
    .from("packages")
    .select("id,type,title,description,includes,duration_minutes,min_people,max_people,base_price_idr", { count: "exact" })
    .eq("is_active", true);

  // apply filter
  switch (filter) {
    case "studio_1":
      q = q.eq("type", "self_photo").ilike("title", "Studio 1%");
      break;
    case "studio_2":
      q = q.eq("type", "self_photo").ilike("title", "Studio 2%").ilike("title", "%(Normal)%");
      break;
    case "studio_2_molding":
      q = q.eq("type", "self_photo").ilike("title", "Studio 2%").ilike("title", "%(Molding)%");
      break;
    case "pas_foto":
      q = q.eq("type", "pas_foto");
      break;
    case "photographer":
      q = q.eq("type", "photographer");
      break;
    case "all":
    default:
      break;
  }

  const { data, error } = await q
    .order("type", { ascending: true })
    .order("base_price_idr", { ascending: true });

  const allCards = groupPackagesToCards(Array.isArray(data) ? data : []);
  const total = allCards.length;
  const from = (page - 1) * pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const cards = allCards.slice(from, from + pageSize);

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#1a0505]">
      <Navbar />
      <PaketHeroSSR />

      {/* Filter pills */}
      <section className="relative bg-[#FBF7F1] pb-4">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap gap-2.5">
            {FILTERS.map((f) => {
              const active = (filter ?? "all") === f.key;
              return (
                <Link
                  key={f.key}
                  href={buildFilterHref(f.key, 1)}
                  className={[
                    "inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
                    active
                      ? "border-[#8B1A1A]/30 bg-[#8B1A1A] text-white"
                      : "border-[#8B1A1A]/20 bg-white/70 text-[#8B1A1A] hover:bg-white",
                  ].join(" ")}
                  style={{ fontFamily: "Inter Tight, sans-serif" }}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-[#3a1a1a]/60" style={{ fontFamily: "Inter Tight, sans-serif" }}>
            Menampilkan {total === 0 ? 0 : from + 1}–{Math.min(total, from + pageSize)} dari {total} paket
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="relative bg-[#FBF7F1] pb-10 lg:pb-16">
        <div className="pointer-events-none absolute left-0 top-1/4 h-[300px] w-[300px] rounded-full bg-[#8B1A1A]/5 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 top-2/3 h-[250px] w-[250px] rounded-full bg-[#D4A373]/10 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl space-y-16 px-5 lg:px-8">
          {error ? (
            <div className="rounded-2xl border border-[#8B1A1A]/20 bg-white/70 p-6 text-sm" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              Gagal load paket: {error.message}
            </div>
          ) : cards.length === 0 ? (
            <div className="rounded-2xl border border-[#8B1A1A]/20 bg-white/70 p-6 text-sm" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              Tidak ada paket di filter ini.
            </div>
          ) : (
            cards.map((pkg, i) => <PackageCard key={pkg.id} data={pkg} index={i} />)
          )}
        </div>

        {/* Pagination */}
        <div className="mx-auto mt-10 max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <Link
              aria-disabled={page <= 1}
              href={buildFilterHref(filter, Math.max(1, page - 1))}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                page <= 1
                  ? "pointer-events-none border-[#8B1A1A]/10 bg-white/40 text-[#8B1A1A]/40"
                  : "border-[#8B1A1A]/20 bg-white/70 text-[#8B1A1A] hover:bg-white",
              ].join(" ")}
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Link>

            <div className="px-3 text-sm text-[#3a1a1a]/70" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              Page <b className="text-[#1a0505]">{page}</b> / {totalPages}
            </div>

            <Link
              aria-disabled={page >= totalPages}
              href={buildFilterHref(filter, Math.min(totalPages, page + 1))}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                page >= totalPages
                  ? "pointer-events-none border-[#8B1A1A]/10 bg-white/40 text-[#8B1A1A]/40"
                  : "border-[#8B1A1A]/20 bg-white/70 text-[#8B1A1A] hover:bg-white",
              ].join(" ")}
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner (biarin seperti sekarang) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8B1A1A] via-[#761414] to-[#5C0E0E] py-16">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative mx-auto max-w-3xl px-5 text-center lg:px-8">
          <h2 className="text-3xl text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "Fraunces, serif", fontWeight: 400 }}>
            Masih bingung pilih paket?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/70 lg:text-base" style={{ fontFamily: "Inter Tight, sans-serif" }}>
            Tim kami siap membantu kamu memilih paket yang paling sesuai.
          </p>
          <a
            href="https://wa.me/6282331555431"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#8B1A1A] transition hover:bg-[#FFD7A8]"
            style={{ fontFamily: "Inter Tight, sans-serif" }}
          >
            Konsultasi via WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}