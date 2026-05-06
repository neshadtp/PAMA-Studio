import { NextRequest, NextResponse } from "next/server";

// ── CONTOH ENDPOINT LOGIN ──
// Ganti logika di bawah dengan koneksi ke database Anda (Prisma, Supabase, dsb.)
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // ─── GANTI BLOK INI DENGAN LOGIKA AUTH ANDA ───
    // Contoh: cari user di database, bandingkan hash password, buat JWT/session
    //
    // const user = await prisma.user.findUnique({ where: { email } });
    // if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    //   return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    // }
    // const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    // ───────────────────────────────────────────────

    // Placeholder response — hapus setelah backend ready
    return NextResponse.json({
      message: "Login berhasil",
      user: { email },
    });
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}