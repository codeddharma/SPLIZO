import type { MetadataRoute } from "next";

const SITE_URL = "https://splizo.codedharma.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/comingsoon", "/signup", "/terms", "/privacy"],
        disallow: [
          "/login",
          "/dashboard",
          "/transactions",
          "/accounts",
          "/categories",
          "/homes",
          "/household",
          "/import",
          "/loans",
          "/people",
          "/vendors",
          "/invite",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
