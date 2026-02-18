import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    plan?: string;
  }

  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      plan?: string;
    };
  }
}
