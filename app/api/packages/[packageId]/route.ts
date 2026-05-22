import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ packageId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { packageId } = await params;

  const { data, error } = await supabase
    .from("packages")
    .select(`
      id,
      type,
      title,
      description,
      includes,
      duration_minutes,
      min_people,
      max_people,
      base_price_idr,
      is_active,
      package_resources (
        resources (
          id,
          code,
          name,
          background_options
        )
      )
    `)
    .eq("id", packageId)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (!data || !data.is_active) {
    return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ package: data });
}
