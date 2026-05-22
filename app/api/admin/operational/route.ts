import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const check = await verifyAdmin();
  if (!check.success) {
    return NextResponse.json({ message: check.error!.message }, { status: check.error!.status });
  }

  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20")));
  const offset = (page - 1) * limit;

// Auto-update orders to 'done' if scheduled_at has passed
const now = new Date().toISOString();
await supabase
  .from("orders")
  .update({ status: "done" })
  .eq("status", "scheduled")
  .lt("scheduled_at", now);

const todayOnly = url.searchParams.get("today") === "true";

if (todayOnly) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("orders")
    .select(`id, status, total_price_idr, created_at, scheduled_at, payment_method, profiles(full_name, email), packages(title)`)
    .gte("scheduled_at", todayStart.toISOString())
    .lte("scheduled_at", todayEnd.toISOString())
    .order("scheduled_at", { ascending: true });

  if (error) return NextResponse.json({ message: "Failed" }, { status: 500 });
  return NextResponse.json({ orders: data || [] });
}

const { data, error, count } = await supabase
  .from("orders")
  .select(`
    id,
    user_id,
    package_id,
    status,
    total_price_idr,
    created_at,
    scheduled_at,
    payment_method,

    profiles (
      full_name,
      email
    ),

    packages (
      title
    )
  `, { count: "exact" })
  .order("created_at", { ascending: false })
  .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }

  return NextResponse.json({
    orders: data || [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    }
  });
}

export async function PATCH(request: NextRequest) {
  console.log("PATCH dipanggil"); // ← tambah
  
  const check = await verifyAdmin();
  if (!check.success) {
    return NextResponse.json({ message: check.error!.message }, { status: check.error!.status });
  }

  const supabase = await createSupabaseServerClient();
  const body = await request.json();
  console.log("Body:", body); // ← tambah
  
  const { orderId, status } = body;

  const VALID_STATUSES = ["pending", "awaiting_payment", "paid", "scheduled", "in_progress", "done", "cancelled"];

  if (!orderId || !status) {
    return NextResponse.json({ message: "Missing orderId or status" }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select(); // ← tambah select untuk lihat hasilnya

  console.log("Update result:", data, "Error:", error); // ← tambah

  if (error) {
    return NextResponse.json({ message: "Failed to update order status" }, { status: 500 });
  }

  return NextResponse.json({ message: "Status updated successfully" });
}