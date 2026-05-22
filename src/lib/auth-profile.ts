import type { SupabaseClient, User } from "@supabase/supabase-js";

const DEFAULT_PROFILE_NAME = "Pelanggan PAMA";

export interface AuthProfile {
  full_name: string;
  email: string;
  role: "client" | "admin";
  phone?: string;
  avatar_url?: string; 
}

interface RawProfileRow {
  full_name: string | null;
  email: string | null;
  role: string | null;
  phone_whatsapp?: string | null;
  avatar_url?: string | null;
}

export function normalizeProfile(profile: RawProfileRow | null | undefined): AuthProfile | null {
  if (!profile) {
    return null;
  }

  return {
    full_name: profile.full_name ?? "",
    email: profile.email ?? "",
    role: profile.role === "admin" ? "admin" : "client",
    phone: profile.phone_whatsapp ?? undefined,
    avatar_url: profile.avatar_url ?? undefined,
  };
}

export function createFallbackProfile(user: User): AuthProfile {
  return {
    full_name: getFallbackName(user.user_metadata?.full_name, user.email),
    email: user.email ?? "",
    role: "client",
    avatar_url: user.user_metadata?.avatar_url ?? undefined,
  };
}

export function createFallbackProfileFromValues(email?: string, fullName?: string): AuthProfile {
  return {
    full_name: getFallbackName(fullName, email),
    email: email ?? "",
    role: "client",
    avatar_url: undefined,
  };
}

export async function fetchProfileByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, email, role, phone_whatsapp, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }

  return normalizeProfile(data);
}

export async function fetchProfileWithFallback(
  supabase: SupabaseClient,
  user: User
): Promise<AuthProfile> {
  return (await fetchProfileByUserId(supabase, user.id)) ?? createFallbackProfile(user);
}

export async function fetchProfileWithFallbackValues(
  supabase: SupabaseClient,
  userId: string,
  email?: string,
  fullName?: string
): Promise<AuthProfile> {
  return (
    (await fetchProfileByUserId(supabase, userId)) ??
    createFallbackProfileFromValues(email, fullName)
  );
}

function getFallbackName(fullName?: string | null, email?: string | null) {
  return fullName?.trim() || email?.split("@")[0] || DEFAULT_PROFILE_NAME;
}
