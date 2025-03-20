import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Acesso ao Sistema</h1>
        <LoginForm />
      </div>
    </main>
  )
}

