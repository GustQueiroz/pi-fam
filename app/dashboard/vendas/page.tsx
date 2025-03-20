import { SaleForm } from "@/components/sale-form";
import { SaleList } from "@/components/sale-list";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function VendasPage() {
  const session = await requireAuth();

  const products = await prisma.product.findMany({
    where: {
      tenantId: session.tenantId,
      status: "ativo",
      quantity: { gt: 0 },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Vendas</h1>
      <SaleForm products={products} tenantId={session.tenantId} />
      <SaleList tenantId={session.tenantId} />
    </div>
  );
}
