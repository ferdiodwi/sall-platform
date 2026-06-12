import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let role: string | null = null;

  // INDUSTRY STANDARD: Use Supabase Auth if configured
  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // In a real app, you'd fetch the user's role from a users table or metadata
      // For this implementation, we'll check user metadata
      role = session.user.user_metadata?.role || "student";
    }
  } else {
    // FALLBACK DEMO MODE: Check local cookie
    role = request.cookies.get("sall_role")?.value || null;
  }

  const path = request.nextUrl.pathname;

  // 1. Protect routes
  if (!role && path !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Prevent logged in users from seeing login
  if (role && path === "/login") {
    if (role === "teacher") {
      return NextResponse.redirect(new URL("/teacher", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Role-based Access Control
  if (role === "student" && path.startsWith("/teacher")) {
    // Students cannot access teacher portal
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
