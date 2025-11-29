import { User } from "@/config/schema";
import { SignJWT, jwtVerify, JWTPayload } from "jose";


const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export type AuthJwtPayload = JWTPayload & {
  email: string;
  name?: string | null;
  role: "admin" | "user";
};

export async function signAuthJwt(user: User) {
  const payload: AuthJwtPayload = {
    email: user.email,
    name: user.name,
    role: user.role as "admin" | "user",
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d") // 7 days
    .sign(secret);

  return token;
}

export async function verifyAuthJwt(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as AuthJwtPayload;
}
