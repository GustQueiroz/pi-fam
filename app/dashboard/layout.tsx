import type React from "react";
import { Navbar } from "@/components/navbar";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session} />
      <main className="container mx-auto p-4 pt-20">{children}</main>
    </div>
  );
}
