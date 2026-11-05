import { auth } from "@/lib/auth";

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }

  const isAdmin = req.auth.user?.role === "admin";
  const onAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  // Admin is a separate panel, not a household view — keep the two apart in
  // both directions instead of just gating /admin.
  if (onAdminRoute && !isAdmin) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
  if (!onAdminRoute && isAdmin) {
    return Response.redirect(new URL("/admin", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/import/:path*",
    "/accounts/:path*",
    "/categories/:path*",
    "/vendors/:path*",
    "/homes/:path*",
    "/people/:path*",
    "/loans/:path*",
    "/household/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/feedback/:path*",
    "/admin/:path*",
  ],
};
