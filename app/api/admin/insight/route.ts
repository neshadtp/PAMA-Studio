import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getAnalyticsData, AnalyticsRange } from "@/lib/analytics-queries";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const check = await verifyAdmin();
  if (!check.success) {
    return NextResponse.json({ message: check.error!.message }, { status: check.error!.status });
  }

  try {
    // Instantiate Groq client at request time to avoid build-time failures
    const groqApiKey = process.env.GROQ_API_INSIGHT_KEY || process.env.GROQ_API_KEY;
    let groq: any = null;
    if (groqApiKey) {
      groq = new Groq({ apiKey: groqApiKey });
    }

    const { range } = (await req.json()) as { range: AnalyticsRange };

    if (!range) {
      return NextResponse.json({ error: "Range is required" }, { status: 400 });
    }

    // 1. Get real data from DB
    const data = await getAnalyticsData(range);

    // 2. Format prompt for Groq
    const prompt = `
      Anda adalah Analis Data Bisnis profesional untuk PAMA Studio (studio fotografi/kreatif) di Indonesia.
      Analisis data bisnis berikut untuk periode ${data.dateRange.start} s/d ${data.dateRange.end} (Laporan ${range} - Waktu Indonesia Barat / WIB):

      - Total Orders: ${data.totalOrders}
      - Completed Orders: ${data.completedOrders}
      - Pending Orders: ${data.pendingOrders}
      - Total Revenue: Rp ${data.totalRevenue.toLocaleString("id-ID")}
      - Top Packages: ${data.popularPackages.map(p => p.title + " (" + p.count + " orders)").join(", ")}
      
      Anda WAJIB merespons HANYA dengan objek JSON yang valid. JSON harus mengikuti struktur ini:
      {
        "executive_summary": "string",
        "performance_analysis": "string",
        "package_insights": "string",
        "recommendations": ["string", "string", "string"]
      }

      Panduan:
      - Gunakan nada profesional, optimis, dan ringkas.
      - Gunakan Bahasa Indonesia yang baik dan benar.
      - Jangan menyertakan teks apa pun sebelum atau sesudah objek JSON.
      - Pastikan rekomendasi bersifat praktis dan dapat segera diterapkan oleh PAMA Studio.
    `;

    // 3. Generate Insight with Groq (Llama 3) if API key is configured
    let insightString = "{}";
    if (groq) {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful business assistant that provides clear and actionable insights in Indonesian. You only output valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 2048,
      });

      insightString = chatCompletion.choices[0]?.message?.content || "{}";
    } else {
      // If no API key configured, return a placeholder insight and avoid throwing during build
      insightString = JSON.stringify({
        executive_summary: "AI insight unavailable (no GROQ API key configured)",
        performance_analysis: "AI insights are disabled. Configure GROQ_API_INSIGHT_KEY to enable.",
        package_insights: "-",
        recommendations: ["Configure GROQ_API_INSIGHT_KEY in environment variables"]
      });
    }
    let insight;
    try {
      insight = JSON.parse(insightString);
    } catch {
      console.error("Failed to parse AI insight:", insightString);
      insight = {
        executive_summary: "Gagal memproses analisis data.",
        performance_analysis: "Terjadi kesalahan saat memformat data AI.",
        package_insights: "Silakan coba lagi beberapa saat lagi.",
        recommendations: ["Periksa koneksi internet", "Refresh halaman", "Hubungi pengembang"]
      };
    }

    return NextResponse.json({
      success: true,
      data,
      insight,
    });
  } catch (error: any) {
    console.error("AI Insight Full Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
