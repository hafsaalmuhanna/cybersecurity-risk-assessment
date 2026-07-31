"use client";
import { createBrowserClient } from "@supabase/ssr";

// Returns a Supabase browser client, or null when env vars are not configured yet
// (so the site still renders with sample data before the DB is wired).
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR-PROJECT")) return null;
  return createBrowserClient(url, key);
}

export const supabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes("YOUR-PROJECT");
};
