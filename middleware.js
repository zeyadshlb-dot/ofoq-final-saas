import { NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, sw.js, manifest.json (metadata files)
     * - public/storage (backend proxy files)
     */
    "/((?!api|public\\/storage|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|sw\\.js|manifest\\.json|offline\\.html).*)",
  ],
};

export default function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Remove port numbers for checking
  const hostWithoutPort = hostname.split(":")[0];

  let rawSubdomain = null;

  const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostWithoutPort);

  // 1. Extract raw subdomain based on environment
  if (hostWithoutPort.endsWith(".localhost")) {
    rawSubdomain = hostWithoutPort.replace(".localhost", "");
  } else if (isIpAddress) {
    // Default to 'alwody' for local network testing via IP
    rawSubdomain = "alwody";
  } else if (hostWithoutPort === "localhost") {
    rawSubdomain = "main"; // Use 'main' as default for localhost root
  } else {
    // Production Domain Handling
    const parts = hostWithoutPort.split(".");

    // If we have a subdomain (e.g. tenant.ofoq.info or www.ofoq.info)
    if (parts.length >= 3) {
      const subdomain = parts[0];
      if (subdomain === "www") {
        rawSubdomain = "main"; // Use 'main' for the root domain (www)
      } else {
        rawSubdomain = subdomain;
      }
    } else {
      // If we are at the root domain (e.g. ofoq.info), default to 'main'
      rawSubdomain = "main";
    }
  }

  // Not a valid subdomain at all, show "Not Allowed"
  if (!rawSubdomain) {
    if (url.pathname.startsWith("/not-allowed")) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL("/not-allowed", req.url));
  }

  // 2. Best Practice applied: Handle "admin-" wildcard subdomains prefix
  // Example: admin-alwody.localhost -> "alwody" is the tenant, "admin-" dictates the route
  let tenant = rawSubdomain;
  let isAdminDomain = false;

  if (rawSubdomain.startsWith("admin-")) {
    isAdminDomain = true;
    tenant = rawSubdomain.replace("admin-", ""); // Extract 'alwody' from 'admin-alwody'
  }

  // 3. Rewrite Paths based on domain type
  // If user visits admin-alwody.localhost/login -> rewrite to /alwody/admin/login
  if (isAdminDomain) {
    // Prevent nested /admin/admin/ in pathname just in case
    const targetPath = url.pathname.startsWith("/admin")
      ? url.pathname
      : `/admin${url.pathname === "/" ? "" : url.pathname}`;

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-is-admin", "true");

    return NextResponse.rewrite(
      new URL(`/${tenant}${targetPath}${url.search}`, req.url),
      {
        request: {
          headers: requestHeaders,
        },
      },
    );
  }

  // Normal Student Domain (alwody.localhost/courses -> /alwody/courses)
  return NextResponse.rewrite(
    new URL(`/${tenant}${url.pathname}${url.search}`, req.url),
  );
}
