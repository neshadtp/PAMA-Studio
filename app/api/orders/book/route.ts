import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Validasi Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parsing Body — slot_id tidak dikirim dari frontend
    const body = await request.json().catch(() => ({}));
    const { packageId, date, time, notes, addons = [] } = body;

    if (!packageId) {
      return NextResponse.json({ message: "packageId required" }, { status: 400 });
    }

    // 3. Ambil data package
    const { data: pkg, error: pkgErr } = await supabase
      .from("packages")
      .select("id, type, duration_minutes, base_price_idr, title")
      .eq("id", packageId)
      .single();

    if (pkgErr || !pkg) {
      return NextResponse.json({ message: "Package not found" }, { status: 404 });
    }

    const duration = pkg.duration_minutes ?? 0;
    let resourceId: string | null = null;

    // 4. Validasi tanggal & jam
    if (duration > 0) {
      if (!date || !time) {
        return NextResponse.json({ message: "Date and time required" }, { status: 400 });
      }

      const { data: pr } = await supabase
        .from("package_resources")
        .select("resource_id")
        .eq("package_id", packageId)
        .maybeSingle();

      if (!pr?.resource_id) {
        return NextResponse.json({ message: "No resource available for this package" }, { status: 400 });
      }
      resourceId = pr.resource_id;
    }

    // 5. Buat Order Awal
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        package_id: packageId,
        status: "pending",
        notes: notes ?? null,
        base_price_idr: pkg.base_price_idr,
        addons_price_idr: 0,
        total_price_idr: pkg.base_price_idr,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ message: "Failed to create order: " + orderErr?.message }, { status: 500 });
    }

    // --- PROSES LANJUTAN (Try/Catch untuk Rollback) ---
    try {
      let addonsTotal = 0;

      // 6. Handle Addons
      if (addons.length > 0) {
        const addonIds = addons.map((a: any) => a.addonId);
        const { data: addonRows, error: addonErr } = await supabase
          .from("addons")
          .select("id, price_idr")
          .in("id", addonIds);

        if (addonErr) throw new Error("Addon error: " + addonErr.message);

        const priceMap = new Map(addonRows?.map((r) => [r.id, r.price_idr]) ?? []);
        const rows = addons.map((a: any) => {
          const price = priceMap.get(a.addonId);
          if (price === undefined) throw new Error(`Invalid addonId: ${a.addonId}`);
          addonsTotal += price * (a.qty ?? 1);
          return {
            order_id: order.id,
            addon_id: a.addonId,
            qty: a.qty ?? 1,
            price_idr: price,
          };
        });

        const { error: oaErr } = await supabase.from("order_addons").insert(rows);
        if (oaErr) throw oaErr;
      }

      // 7. Update Total Harga
      const total = pkg.base_price_idr + addonsTotal;
      const { error: updErr } = await supabase
        .from("orders")
        .update({ addons_price_idr: addonsTotal, total_price_idr: total })
        .eq("id", order.id);

      if (updErr) throw updErr;

      // 8. Insert Booking — slot_id null karena sudah nullable
      if (duration > 0 && resourceId) {
        const timeStart = time.split("-")[0].replace(".", ":");
        const startAt = new Date(`${date}T${timeStart}:00+07:00`);
        if (isNaN(startAt.getTime())) throw new Error("Format tanggal/waktu tidak valid");

        const endAt = addMinutes(startAt, duration);
        const timeRange = `[${startAt.toISOString()},${endAt.toISOString()})`;

        await supabase
          .from("orders")
          .update({ scheduled_at: startAt.toISOString() })
          .eq("id", order.id);

        const { error: bookErr } = await supabase.from("bookings").insert({
          order_id: order.id,
          time_range: timeRange,
          // slot_id nullable, tidak dikirim
        });

        if (bookErr) throw new Error("Slot sudah terisi atau error sistem: " + bookErr.message);
      }
      return NextResponse.json({ ok: true, orderId: order.id });

    } catch (innerError: any) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw innerError;
    }

  } catch (e: any) {
    console.error("Booking Error:", e);
    return NextResponse.json(
      { ok: false, message: e?.message ?? "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}