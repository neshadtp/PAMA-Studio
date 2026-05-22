import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("package_id")
    .not("status", "eq", "cancelled");

  const freq = new Map<string, number>();
  for (const o of orders ?? []) {
    freq.set(o.package_id, (freq.get(o.package_id) ?? 0) + 1);
  }

  const { data, error } = await supabase
    .from("packages")
    .select("id, type, title, description, includes, duration_minutes, min_people, max_people, base_price_idr")
    .eq("is_active", true);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const allPackages = data ?? [];
  const sorted = [...allPackages].sort((a, b) =>
    (freq.get(b.id) ?? 0) - (freq.get(a.id) ?? 0)
  );

  const seen = new Set<string>();
  const top3 = [];
  for (const pkg of sorted) {
    const key = getStudioKey(pkg);
    if (!seen.has(key)) {
      seen.add(key);
      top3.push(pkg);
    }
    if (top3.length >= 3) break;
  }

  if (top3.length < 3) {
    for (const pkg of sorted) {
      if (!top3.find(p => p.id === pkg.id)) {
        top3.push(pkg);
      }
      if (top3.length >= 3) break;
    }
  }

  const groupedPackages = groupPackagesByStudio(top3);
  return NextResponse.json({ packages: groupedPackages });
}

function groupPackagesByStudio(packages: any[]) {
  const groups = new Map<string, any[]>();

  for (const pkg of packages) {
    const key = getStudioKey(pkg);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(pkg);
  }

  const result = [];
  for (const [key, items] of groups) {
    const featured = key.includes("Studio 2") && !key.includes("Molding");
    result.push({
  id: items[0].id,
  studio: key,
  type: items[0].type,
  price: items[0].base_price_idr,
  priceFormatted: items[0].title, // ← ganti dari formatIDR jadi title paket
  features: parseIncludes(items[0].includes),
  image: getDefaultImage(key),
  featured,
  tag: getTag(key, featured),
});
  }

  return result;
}

function getStudioKey(pkg: any): string {
  const desc = (pkg.description ?? "").toLowerCase();
  if (pkg.type === "pas_foto") return "Pas Foto";
  if (pkg.type === "photographer" || pkg.type === "jasa_fotografer") return "Jasa Fotografer";
  if (pkg.type === "self_photo") {
    if (desc.includes("studio 1")) return "Self Photo Studio 1";
    if (desc.includes("studio 2") && desc.includes("molding")) return "Studio 2 (Molding)";
    if (desc.includes("studio 2")) return "Self Photo Studio 2";
  }
  return pkg.title;
}

function getTag(key: string, featured: boolean): string {
  if (featured) return "Favorit Couple";
  if (key.includes("Pas Foto")) return "Paling Populer";
  if (key.includes("Studio 1")) return "Terlaris Grup";
  return "Pilihan Kami";
}

function parseIncludes(includes: string | null): string[] {
  if (!includes) return [];
  return includes.split(",").map(s => s.trim()).filter(Boolean);
}

function getDefaultImage(key: string): string {
  const images: Record<string, string> = {
    "Self Photo Studio 1": "/images/foto6.webp",
    "Self Photo Studio 2": "/images/foto7.webp",
    "Studio 2 (Molding)": "/images/molding.webp",
    "Pas Foto": "/images/pasfoto1.webp",
    "Jasa Fotografer": "/images/foto11.webp",
  };
  return images[key] || "/images/foto1.webp";
}

