import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { resolveWpRedirect, toSqPath } from "@/lib/redirects";

/**
 * Next 16 proxy (replaces middleware). Three jobs:
 *
 * 1. Legacy WordPress 301s — old URL structure and ?lang=sq → new URLs.
 *
 * 2. /admin/* — session gate. Unauthenticated requests redirect to
 *    /admin/login; the Supabase session cookie is refreshed on the way
 *    through. (Fine-grained editor checks happen again server-side.)
 *
 * 3. Locale routing:
 *      /         → rewrite to /en (invisible — EN lives at the root)
 *      /sq/...   → passes through to the [locale]='sq' tree
 *      /en/...   → 301 to the unprefixed path (canonical hygiene)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Legacy WordPress redirects (301) ------------------------------------
  if (!pathname.startsWith("/admin")) {
    const wpTarget = resolveWpRedirect(pathname);
    const wantsSq = request.nextUrl.searchParams.get("lang") === "sq";

    if (wpTarget || wantsSq) {
      const url = request.nextUrl.clone();
      const basePath = wpTarget ?? pathname;
      url.pathname = wantsSq && !basePath.startsWith("/sq") ? toSqPath(basePath) : basePath;
      url.searchParams.delete("lang");
      return NextResponse.redirect(url, 301);
    }
  }

  // --- Admin session gate -------------------------------------------------
  if (pathname.startsWith("/admin")) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (pathname === "/admin/login") {
      // Already signed in? Go straight to the dashboard.
      if (user) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
      return response;
    }

    if (!user) {
      // Server-action POSTs must not be redirected: the browser's fetch
      // follows the 307 transparently and receives the login page's HTML,
      // which the client rejects with "An unexpected response was received
      // from the server." Let them through — every action re-checks auth via
      // requireEditor(), whose redirect() the client handles as a clean
      // navigation to /admin/login.
      if (request.method === "POST" && request.headers.has("next-action")) {
        return response;
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // --- Locale routing -----------------------------------------------------
  // Literal /en URLs redirect to the clean root path.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 301);
  }

  // Albanian tree matches [locale]='sq' directly.
  if (pathname === "/sq" || pathname.startsWith("/sq/")) {
    return NextResponse.next();
  }

  // Everything else is English — rewrite internally under /en.
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and static files.
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\..*).*)"],
};
