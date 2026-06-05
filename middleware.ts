import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const GUEST_ROUTES = [
  "/login",
  "/register",
  "/reset-password",
  "/verify-email",
  "/forgot-password",
];

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // Fix cookie name mismatch between http and https
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
  });

  const isAuth = !!token;
  const pathname = req.nextUrl.pathname;

  const isRootRoute = pathname === "/";
  const isGuestRoute = GUEST_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isRootRoute || isGuestRoute) {
    if (isAuth) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  if (!isAuth) {
    // ✅ Set callbackUrl as RELATIVE path, not absolute
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // ✅ Removed login/register from exclusions — let middleware handle them
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public-masjids).*)",
  ],
};