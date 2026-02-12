import { NextRequest, NextResponse } from "next/server";

const SUPPORTED = ["en", "ar", "zh", "ru", "de", "fr", "hi"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth handling
  if (pathname.startsWith("/admin")) {
    const isAuthenticated = request.cookies.get("admin_authenticated")?.value === "true";

    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Skip Next internals, API, sitemap files, and static assets
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    // Sitemap files (both main and language-specific)
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/sitemap-") && pathname.endsWith(".xml") ||
    // Static assets that should not be localized
    pathname === "/site.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".mp3") ||
    pathname.endsWith(".mp4") ||
    pathname.endsWith(".webm") ||
    pathname.endsWith(".pdf")
  ) {
    return NextResponse.next();
  }

  // Locale handling: if already has locale, continue
  const pathLocale = pathname.split("/").filter(Boolean)[0];
  if (SUPPORTED.includes(pathLocale)) {
    return NextResponse.next();
  }

  // Detect from headers and redirect to locale-prefixed path
  const header = request.headers.get("accept-language") || "en";
  const preferred = header.split(",")[0].split("-")[0];
  const locale = SUPPORTED.includes(preferred) ? preferred : "en";

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap files
     * - static assets (images, audio, manifest, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon|sitemap|site\\.webmanifest|robots\\.txt).*)",
  ],
};
