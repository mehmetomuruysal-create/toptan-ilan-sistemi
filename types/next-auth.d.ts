import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import { HesapTuru, UserStatus } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string;
    hesapTuru: HesapTuru;
    isAdmin: boolean;
    onayDurumu: UserStatus;
    rol?: string; // TS'nin ağlamaması için yedek olarak duruyor
  }

  interface Session {
    user: {
      id: string;
      hesapTuru: HesapTuru;
      isAdmin: boolean;
      onayDurumu: UserStatus;
      rol?: string;
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    hesapTuru: HesapTuru;
    isAdmin: boolean;
    onayDurumu: UserStatus;
    rol?: string;
  }
}