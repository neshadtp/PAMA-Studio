import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { verifyAdmin } from "@/lib/auth-helpers";

const CALENDAR_STATUSES = ["pending", "awaiting_payment", "paid", "scheduled", "in_progress", "done"];

function buildMonthRange(year: number, month: number) {
  const paddedMonth = String(month).padStart(2, "0");
  const start = new Date(`${year}-${paddedMonth}-01T00:00:00+07:00`).toISOString();
  const lastDay = new Date(year, month, 0).getDate();
  const end = new Date(`${year}-${paddedMonth}-${String(lastDay).padStart(2, "0")}T23:59:59.999+07:00`).toISOString();
  return { start, end };
}

export async function GET(request: NextRequest) {
  const check = await verifyAdmin();
  if (!check.success) {
    return NextResponse.json({ message: check.error!.message }, { status: check.error!.status });
  }

  const url = new URL(request.url);
  const now = new Date();
  const year = Number(url.searchParams.get("year") ?? now.getFullYear());
  const month = Number(url.searchParams.get("month") ?? now.getMonth() + 1);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ message: "Invalid year or month" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { start, end } = buildMonthRange(year, month);

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      scheduled_at,
      total_price_idr,
      profiles (
        full_name
      ),
      packages (
        title
      )
    `)
    .gte("scheduled_at", start)
    .lte("scheduled_at", end)
    .in("status", CALENDAR_STATUSES)
    .order("scheduled_at", { ascending: true });

  if (error) {
    return NextResponse.json({ message: "Failed to fetch calendar orders" }, { status: 500 });
  }

  return NextResponse.json({
    orders: data || [],
  });
}