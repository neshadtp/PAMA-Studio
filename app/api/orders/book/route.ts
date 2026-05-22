import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";

// Helper: Parse slot waktu dengan timezone WIB (+07:00)
function parseSlotStart(date: string, time: string): Date | null {
  const match = time.match(/^(\d{2})\.(\d{2})-(\d{2})\.(\d{2})$/);
  if (!match) return null;

  const startTime = `${match[1]}:${match[2]}`;
  const startAt = new Date(`${date}T${startTime}:00+07:00`);
  return Number.isNaN(startAt.getTime()) ? null : startAt;
}

export async function POST(request: Request) {
  // FIX: Sesuaikan dengan implementasi createSupabaseServerClient Anda
  // Jika fungsi tidak menerima parameter, hapus `request`
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Validasi Auth - FIX: destructuring yang benar
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;
    
    if (authError || !user) {
      console.warn("Auth error:", authError?.message || "No user");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parsing Body dengan error handling
    let body: Record<string, any>;
    try {
      body = await request.json();
    } catch (error: unknown) {
  console.warn("JSON parse error:", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const { packageId, date, time, notes, addons = [] } = body;

    // Sanitasi notes
    const sanitizedNotes = notes
      ? String(notes).replace(/<[^>]*>/g, "").trim().slice(0, 500)
      : null;

    if (!packageId) {
      return NextResponse.json({ message: "packageId required" }, { status: 400 });
    }

    // 3. Ambil data package - FIX: akses .data dengan benar
    const { data: pkg, error: pkgErr } = await supabase
      .from("packages")
      .select("id, type, duration_minutes, base_price_idr, title")
      .eq("id", packageId)
      .maybeSingle();

    if (pkgErr) {
      console.error("Package query error:", pkgErr);
      return NextResponse.json({ message: "Failed to fetch package" }, { status: 500 });
    }

    if (!pkg) {
      return NextResponse.json({ message: "Package not found" }, { status: 404 });
    }

    const duration = pkg.duration_minutes ?? 0;

    // 4. Validasi tanggal & jam
    let startAt: Date | null = null;
    if (duration > 0) {
      if (!date || !time) {
        return NextResponse.json({ message: "Date and time required for scheduled packages" }, { status: 400 });
      }

      startAt = parseSlotStart(date, time);
      if (!startAt) {
        return NextResponse.json({ message: "Format tanggal/waktu tidak valid. Gunakan HH.MM-HH.MM" }, { status: 400 });
      }

      // Cek duplikasi order - FIX: akses .data dengan benar
      const { data: existingOrder, error: duplicateErr } = await supabase
        .from("orders")
        .select("id")
        .eq("package_id", packageId)
        .eq("scheduled_at", startAt.toISOString())
        .in("status", ["pending", "awaiting_payment", "paid", "scheduled", "in_progress"])
        .maybeSingle();

      if (duplicateErr) {
        console.error("Duplicate check error:", duplicateErr);
        return NextResponse.json({ message: "Gagal memeriksa ketersediaan slot" }, { status: 500 });
      }

      if (existingOrder?.id) {
        return NextResponse.json({ 
          ok: true, 
          orderId: existingOrder.id, 
          duplicate: true, 
          message: "Booking sudah ada untuk slot ini" 
        });
      }
    }

    // 5. Buat Order Utama - FIX: akses .data dengan benar
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        package_id: packageId,
        status: "pending",
        notes: sanitizedNotes,
        base_price_idr: pkg.base_price_idr ?? 0,
        addons_price_idr: 0,
        total_price_idr: pkg.base_price_idr ?? 0,
        scheduled_at: startAt ? startAt.toISOString() : null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("Order creation error:", orderErr);
      return NextResponse.json({ message: "Failed to create order: " + orderErr?.message }, { status: 500 });
    }

    // --- PROSES LANJUTAN: ADDONS & UPDATES ---
    try {
      let addonsTotal = 0;

      // 6. Handle Addons
      if (Array.isArray(addons) && addons.length > 0) {
        const parsedAddons = addons
          .map((a: any) => ({
            addonId: String(a?.addonId ?? "").trim(),
            qty: Number(a?.qty ?? 1),
          }))
          .filter((a): a is { addonId: string; qty: number } => 
            !!a.addonId && !Number.isNaN(a.qty)
          );

        // Validasi qty
        if (parsedAddons.some((a) => !Number.isInteger(a.qty) || a.qty < 1 || a.qty > 10)) {
          throw new Error("Qty addon harus antara 1 sampai 10");
        }

        if (parsedAddons.length > 0) {
          const addonIds = parsedAddons.map((a) => a.addonId);

          // FIX: akses .data dengan benar + typing
          const { data: addonRows, error: addonErr } = await supabase
            .from("addons")
            .select("id, price_idr")
            .in("id", addonIds);

          if (addonErr) throw new Error("Failed to fetch addons: " + addonErr.message);
          if (!addonRows || addonRows.length === 0) throw new Error("No valid addons found");

          const priceMap = new Map<string, number>(
            addonRows.map((r: { id: string; price_idr: number }) => [r.id, r.price_idr])
          );
          
          const rows: Array<{
            order_id: string;
            addon_id: string;
            qty: number;
            price_idr: number;
          }> = [];

          for (const a of parsedAddons) {
            const price = priceMap.get(a.addonId);
            if (price === undefined) throw new Error(`Invalid addonId: ${a.addonId}`);
            if (price === null) throw new Error(`Price is null for addon: ${a.addonId}`);

            addonsTotal += price * a.qty;
            rows.push({
              order_id: order.id,
              addon_id: a.addonId,
              qty: a.qty,
              price_idr: price,
            });
          }

          const { error: oaErr } = await supabase.from("order_addons").insert(rows);
          if (oaErr) throw new Error("Failed to save order addons: " + oaErr.message);
        }
      }

      // 7. Update Total Harga (jika ada addons)
      if (addonsTotal > 0) {
        const basePrice = pkg.base_price_idr ?? 0;
        const total = basePrice + addonsTotal;
        
        const { error: updErr } = await supabase
          .from("orders")
          .update({
            addons_price_idr: addonsTotal,
            total_price_idr: total,
          })
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
      // ROLLBACK: Hapus order jika proses addons/update gagal
      console.error("Rollback triggered:", innerError?.message);
      await supabase.from("orders").delete().eq("id", order.id);

      return NextResponse.json(
        { 
          ok: false, 
          message: innerError?.message ?? "Terjadi kesalahan saat memproses addons" 
        },
        { status: 500 }
      );
    }

  } catch (e: any) {
    console.error("🔥 Booking API Error:", e?.message || e);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}