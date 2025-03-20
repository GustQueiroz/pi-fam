import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Sistema de Gestão</h1>
        <p className="text-xl text-muted-foreground">Gerencie seu estoque e vendas de forma simples e eficiente</p>
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Entrar no Sistema</Link>
        </Button>
      </div>
    </main>
  )
}

