"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, Package, ShoppingCart, User } from "lucide-react";
import type { UserSession } from "@/lib/auth";

interface NavbarProps {
  user: UserSession;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Início",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      label: "Estoque",
      href: "/dashboard/estoque",
      icon: <Package className="mr-2 h-4 w-4" />,
    },
    {
      label: "Vendas",
      href: "/dashboard/vendas",
      icon: <ShoppingCart className="mr-2 h-4 w-4" />,
    },
    {
      label: "Usuário",
      href: "/dashboard/usuario",
      icon: <User className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <header className="fixed w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between ">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/dashboard" className="font-bold text-xl">
            Sistema de Gestão
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={item.href}>
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
