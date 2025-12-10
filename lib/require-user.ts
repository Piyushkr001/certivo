// lib/require-user.ts
import { cookies } from "next/headers";
import { verifyAuthJwt } from "@/lib/auth-jwt";

export async function requireUser() {
  const token = (await cookies()).get("certivo_token")?.value ?? null;
  if (!token) {
    throw new Error("UNAUTHENTICATED");
  }

  const payload = await verifyAuthJwt(token);
  const sub = (payload as any).sub;
  const role = (payload as any).role;

  const userId = Number(sub);
  if (!userId || Number.isNaN(userId)) {
    throw new Error("UNAUTHENTICATED");
  }

  return {
    id: userId,
    role: role as "admin" | "user" | undefined,
    email: (payload as any).email as string | undefined,
  };
}
