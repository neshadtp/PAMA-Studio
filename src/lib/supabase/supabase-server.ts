import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  let cookieStore;
  
  try {
    cookieStore = await cookies();
  } catch {
    // During build time or without request context, cookies() may not be available
    // Provide a no-op cookie store that returns empty values
    cookieStore = {
      getAll: () => [],
      set: () => {},
    } as any;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options) // ✅ pakai options dari Supabase
            );
          } catch {}
        },
      },
    }
  );
}