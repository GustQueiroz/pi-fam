import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardStats } from "@/components/dashboard-stats";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await requireAuth();

  const productCount = await prisma.product.count({
    where: { tenantId: session.tenantId },
  });

  const salesCount = await prisma.sale.count({
    where: { tenantId: session.tenantId },
  });

  const totalSales = await prisma.sale.aggregate({
    where: { tenantId: session.tenantId },
    _sum: { total: true },
  });

  const stats = {
    productCount,
    salesCount,
    totalSales: totalSales._sum.total || 0,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Início</h1>
      <DashboardStats stats={stats} />
      <DashboardCharts tenantId={session.tenantId} />
    </div>
  );
}
