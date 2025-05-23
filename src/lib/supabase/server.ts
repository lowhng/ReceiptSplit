import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type CookieOptions } from "@supabase/ssr";

export const createClient = (cookieStore = cookies()) => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.error(`Error setting cookie ${name}:`, error);
          }
        },
        remove(name, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            console.error(`Error removing cookie ${name}:`, error);
          }
        },
      },
    },
  );
};
