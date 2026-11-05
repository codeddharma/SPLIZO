import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      householdId: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    householdId: string;
    role: UserRole;
  }
}

// `next-auth/jwt` only re-exports `@auth/core/jwt`, so augmenting that path
// declares a separate, unused interface. Augment the module that actually
// owns `JWT`, or its index signature leaves these fields typed `unknown`.
declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
    householdId?: string;
    role?: UserRole;
  }
}
