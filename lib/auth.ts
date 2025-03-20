"use server";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export type UserSession = {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: "administrador" | "usuario";
};

type SignInProps = {
  email: string;
  password: string;
};

export async function signIn({ email, password }: SignInProps) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user) return false;

  if (user.password !== password) return false;

  const session: UserSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    tenantId: user.tenantId,
    role: user.role as "administrador" | "usuario",
  };

  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);

  (await cookies()).set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return true;
}

export async function signOut() {
  (await cookies()).delete("session-token");
  redirect("/login");
}

export async function getSession(): Promise<UserSession | null> {
  const token = (await cookies()).get("session-token")?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as UserSession;
  } catch (error) {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "administrador") {
    redirect("/dashboard");
  }

  return session;
}
