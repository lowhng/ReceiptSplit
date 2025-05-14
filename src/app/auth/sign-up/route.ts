import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      `/login?error=${encodeURIComponent(error.message)}`,
      {
        status: 303,
      },
    );
  }

  return NextResponse.redirect(
    new URL(
      "/login?message=Check email to continue sign in process",
      request.url,
    ),
    {
      status: 303,
    },
  );
}
