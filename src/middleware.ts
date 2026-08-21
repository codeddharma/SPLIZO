import { auth } from "@/lib/auth";

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/import/:path*",
    "/accounts/:path*",
    "/categories/:path*",
    "/vendor-rules/:path*",
    "/homes/:path*",
    "/people/:path*",
    "/loans/:path*",
  ],
};
