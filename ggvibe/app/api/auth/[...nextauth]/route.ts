import NextAuth from "next-auth";
import { buildAuthOptions } from "@/lib/auth";

const handler = NextAuth(buildAuthOptions());

export { handler as GET, handler as POST };
