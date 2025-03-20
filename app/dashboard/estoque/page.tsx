import { ProductList } from "@/components/product-list"
import { ProductForm } from "@/components/product-form"
import { requireAuth } from "@/lib/auth"

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const session = await requireAuth()
  const status = searchParams.status || "todos"

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Estoque</h1>
      <ProductForm tenantId={session.tenantId} />
      <ProductList tenantId={session.tenantId} statusFilter={status} />
    </div>
  )
}

