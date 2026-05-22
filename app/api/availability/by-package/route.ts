import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";

const OPEN_HOUR = 9;
const OPEN_MINUTE = 30;
const CLOSE_HOUR = 21;
const CLOSE_MINUTE = 0;

const BOOKED_STATUSES = ["pending", "awaiting_payment", "paid", "scheduled", "in_progress"];

// Penentuan interval total blokir ruangan murni dari metadata resource database Supabase
function getRoomIntervalMinutes(resourceCode: string | undefined): number {
  if (resourceCode === "studio1" || resourceCode === "pasfoto") {
    return 30; // Pas Foto dan Studio 1 dapet blokir slot ruangan 30 menit
  }
  if (resourceCode === "studio2" || resourceCode === "studio2molding") {
    return 60; // Studio 2 dan Molding dapet blokir slot ruangan 60 menit (1 jam)
  }
  return 30; // Fallback default ruangan standar
}

// Generate slot ruangan utuh (30 atau 60 menit) agar tampilan jam rapi sesuai interval ruangan
function generateAllSlots(roomIntervalMinutes: number): string[] {
  const slots: string[] = [];
  let current = OPEN_HOUR * 60 + OPEN_MINUTE;
  const closeTotal = CLOSE_HOUR * 60 + CLOSE_MINUTE;

  while (current + roomIntervalMinutes <= closeTotal) {
    const startH = Math.floor(current / 60);
    const startM = current % 60;
    const endMin = current + roomIntervalMinutes;
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;

    const label = `${String(startH).padStart(2, "0")}.${String(startM).padStart(2, "0")}-${String(endH).padStart(2, "0")}.${String(endM).padStart(2, "0")}`;
    slots.push(label);

    current += roomIntervalMinutes; // Langkah interval sejalan dengan durasi ruangan
  }

  return slots;
}

function slotToMinutes(slot: string): { start: number; end: number } | null {
  const match = slot.match(/^(\d{2})\.(\d{2})-(\d{2})\.(\d{2})$/);
  if (!match) return null;
  const start = parseInt(match[1]) * 60 + parseInt(match[2]);
  const end = parseInt(match[3]) * 60 + parseInt(match[4]);
  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get("packageId");
    const date = searchParams.get("date");

    if (!packageId || !date) {
      return NextResponse.json({ message: "packageId dan date wajib diisi" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Fetch data packages dengan inner join table package_resources & resources
    const { data: pkg, error: pkgErr } = await supabase
      .from("packages")
      .select(`
        id, 
        type, 
        title, 
        duration_minutes,
        package_resources (
          resources (
            code,
            name
          )
        )
      `)
      .eq("id", packageId)
      .single();

    if (pkgErr || !pkg) {
      return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });
    }

    // Tangkap resource code database relasi record pertama
    const packageResources = pkg.package_resources as any;
    const resourceCode = packageResources?.[0]?.resources?.code;

    // KONDISI KHUSUS FOTOGRAFER: Pengaturan kustomisasi jadwal admin tanpa slot reguler
    if (resourceCode === "jasafotografer") {
      return NextResponse.json({
        slots: [],
        available: [],
        interval: 0,
        requiresAdmin: true,
        message: "Paket Jasa Fotografer memerlukan penyesuaian jadwal manual oleh Admin."
      });
    }

    const durationMinutes: number = pkg.duration_minutes ?? 0;
    if (durationMinutes <= 0) {
      return NextResponse.json({ slots: [] });
    }

    // Ambil besaran interval ruangan (Pas Foto otomatis dapet 30 menit lewat fungsi di atas)
    const roomInterval = getRoomIntervalMinutes(resourceCode);
    const allSlots = generateAllSlots(roomInterval);

    const dayStart = new Date(`${date}T00:00:00+07:00`).toISOString();
    const dayEnd = new Date(`${date}T23:59:59.999+07:00`).toISOString();

    // Mengambil orderan terbooking untuk validasi tabrakan jadwal
    const { data: bookedOrders, error: ordersErr } = await supabase
      .from("orders")
      .select("scheduled_at, package_id")
      .gte("scheduled_at", dayStart)
      .lte("scheduled_at", dayEnd)
      .in("status", BOOKED_STATUSES);

    if (ordersErr) {
      return NextResponse.json({ message: ordersErr.message }, { status: 500 });
    }

    const packageIds = [...new Set((bookedOrders ?? []).map((o: any) => o.package_id))];

    const bookedPackageIntervals: Record<string, number> = {};
    if (packageIds.length > 0) {
      const { data: bPackages } = await supabase
        .from("packages")
        .select(`
          id,
          package_resources (
            resources (
              code
            )
          )
        `)
        .in("id", packageIds);

      for (const p of bPackages ?? []) {
        const bResCode = (p.package_resources as any)?.[0]?.resources?.code;
        bookedPackageIntervals[p.id] = getRoomIntervalMinutes(bResCode);
      }
    }

    // Hitung range menit bentrokan sewa ruangan berdasarkan interval masing-masing paket terbooking
    const bookedRanges: { start: number; end: number }[] = [];
    for (const order of bookedOrders ?? []) {
      const scheduledAt = new Date(order.scheduled_at);
      const wibOffset = 7 * 60;
      const localMinutes = scheduledAt.getUTCHours() * 60 + scheduledAt.getUTCMinutes() + wibOffset;
      
      const orderRoomInterval = bookedPackageIntervals[order.package_id] ?? roomInterval;
      
      bookedRanges.push({
        start: localMinutes % (24 * 60),
        end: (localMinutes + orderRoomInterval) % (24 * 60),
      });
    }

    // Cek ketersediaan slot satu per satu
    const slots = allSlots.map((slotLabel) => {
      const range = slotToMinutes(slotLabel);
      if (!range) return { time: slotLabel, available: false };

      const isBooked = bookedRanges.some(
        (booked) => range.start < booked.end && range.end > booked.start
      );

      return {
        time: slotLabel,
        available: !isBooked,
      };
    });

    const available = slots.filter((slot) => slot.available);

    return NextResponse.json({
      slots,
      available,
      interval: roomInterval,
      requiresAdmin: false,
    });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Server error" }, { status: 500 });
  }
}