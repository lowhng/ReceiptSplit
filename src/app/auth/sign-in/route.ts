import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(
      `/login?error=${encodeURIComponent(error.message)}`,
      {
        status: 303, // 303 See Other is more appropriate for form submissions
      },
    );
  }

  return NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
}
