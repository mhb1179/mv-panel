"use client";
import { SessionProvider, useSession } from "next-auth/react";
export default function AuthProvider({ children }) {
  const session = useSession()
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
