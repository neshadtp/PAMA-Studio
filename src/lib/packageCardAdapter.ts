import type { PackageData } from "@/components/paket/PackageCard";

type DbPackage = {
  id: string;
  type: "self_photo" | "pas_foto" | "photographer";
  title: string;
  description: string | null;
  includes: string | null;
  duration_minutes: number | null;
  min_people: number | null;
  max_people: number | null;
  base_price_idr: number;
};

function formatIDR(n: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

function getGroupKey(p: DbPackage): string {
  const t = p.title.toLowerCase();
  if (t.includes("studio 1")) return "Studio 1";
  if (t.includes("studio 2") && t.includes("molding")) return "Studio 2 (Molding)";
  if (t.includes("studio 2")) return "Studio 2";
  if (p.type === "pas_foto") return "Pas Foto";
  if (p.type === "photographer") return "Jasa Fotografer";
  return p.title;
}

function defaultImagesByGroup(groupKey: string) {
  if (groupKey === "Studio 1") return {
    image: "/images/foto6.jpg",
    galleryImages: ["/images/foto1.jpg", "/images/foto2.jpg", "/images/foto3.jpg", "/images/foto4.jpg", "/images/foto5.jpg", "/images/foto6.jpg"],
  };
  if (groupKey === "Studio 2 (Molding)") return {
    image: "/images/molding.jpeg",
    galleryImages: ["/images/foto7.jpg", "/images/foto8.jpg", "/images/foto9.jpg", "/images/foto10.jpg"],
  };
  if (groupKey === "Studio 2") return {
    image: "/images/foto7.jpg",
    galleryImages: ["/images/foto7.jpg", "/images/foto8.jpg", "/images/foto9.jpg", "/images/foto10.jpg"],
  };
  if (groupKey === "Pas Foto") return {
    image: "/images/pasfoto1.jpg",
    galleryImages: ["/images/foto11.jpg", "/images/foto12.jpg", "/images/foto1.jpg", "/images/foto3.jpg"],
  };
  return {
    image: "/images/foto11.jpg",
    galleryImages: ["/images/foto11.jpg", "/images/foto12.jpg", "/images/foto1.jpg", "/images/foto3.jpg"],
  };
}

function getSubtitle(type: DbPackage["type"]) {
  if (type === "self_photo") return "Self Photo Studio";
  if (type === "pas_foto") return "Pas Foto";
  return "Jasa Fotografer";
}

export function groupPackagesToCards(rows: DbPackage[]): PackageData[] {
  const groupMap = new Map<string, DbPackage[]>();

  for (const row of rows) {
    const key = getGroupKey(row);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(row);
  }

  const result: PackageData[] = [];

  for (const [groupKey, items] of groupMap) {
    items.sort((a, b) => a.base_price_idr - b.base_price_idr);
    const first = items[0];
    const { image, galleryImages } = defaultImagesByGroup(groupKey);

    const subPackages = items.map((p) => {
      const people =
        p.min_people && p.max_people ? `${p.min_people}-${p.max_people} orang`
        : p.max_people ? `Maks ${p.max_people} orang`
        : "";
      const dur = p.duration_minutes ? `${p.duration_minutes} menit` : "";

      // Ambil nama varian: bagian setelah "—" di title
      const variantName = p.title.includes("—")
        ? p.title.split("—").pop()?.trim() ?? p.title
        : p.title
            .replace(/studio \d+/gi, "")
            .replace(/\(.*?\)/gi, "")
            .trim() || p.title;

      return {
        name: variantName,
        description: [people, dur].filter(Boolean).join(" • "),
        price: formatIDR(p.base_price_idr),
      };
    });

    result.push({
      id: groupKey.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, ""),
      title: groupKey,
      subtitle: getSubtitle(first.type),
      description: first.includes ?? first.description ?? "",
      image,
      galleryImages,
      subPackages,
      additionals: undefined,
      ctaLabel: "Booking Sekarang",
      ctaLink: `/checkout?packageId=${encodeURIComponent(first.id)}`,
      accent: "maroon",
    });
  }

  return result;
}