import { NextRequest, NextResponse } from "next/server";

// ── CONTOH ENDPOINT REGISTER ──
// Ganti logika di bawah dengan koneksi ke database Anda (Prisma, Supabase, dsb.)
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // ─── GANTI BLOK INI DENGAN LOGIKA AUTH ANDA ───
    // Contoh: cek apakah email sudah terdaftar, hash password, simpan ke DB
    //
    // const existing = await prisma.user.findUnique({ where: { email } });
    // if (existing) {
    //   return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 409 });
    // }
    // const passwordHash = await bcrypt.hash(password, 12);
    // const user = await prisma.user.create({
    //   data: { name, email, passwordHash },
    // });
    // ───────────────────────────────────────────────

    // Placeholder response — hapus setelah backend ready
    return NextResponse.json({
      message: "Registrasi berhasil",
      user: { name, email },
    });
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}