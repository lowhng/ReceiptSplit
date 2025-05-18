import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const name = String(formData.get("name") || "");
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
      data: {
        name: name,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If email confirmation is enabled, inform the user to check their email
  if (data?.user && !data?.session) {
    return NextResponse.json({
      message: "Check your email for the confirmation link",
    });
  }

  // If email confirmation is disabled, redirect to home page
  return NextResponse.redirect(new URL("/", request.url), {
    status: 303, // 303 See Other is more appropriate for form submissions
  });
}
