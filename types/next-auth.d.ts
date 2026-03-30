import "next-auth"
import "next-auth/jwt"

type AppRole = "ALICI" | "SATICI"

declare module "next-auth" {
  interface User {
    rol: AppRole
  }

  interface Session {
    user: {
      rol: AppRole
    } & Session["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: AppRole
  }
}
