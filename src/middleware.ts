import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createClient();

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Add your protected routes here
    const protectedRoutes = ["/account"];

    if (
      !session &&
      protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route),
      )
    ) {
      const redirectUrl = new URL("/", request.nextUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Continue the request even if there's an error with auth
    return NextResponse.next();
  }
}

export const config = {
  // Skip all paths that should not be checked
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*.svg).*)"],
};
