import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
    });
  }

  try {
    const sales = await prisma.sale.findMany({
      where: {
        tenantId: session.tenantId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao buscar vendas" }),
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
    });
  }

  try {
    const { clientName, clientPhone, items } = await request.json();

    if (!clientName || !items || !items.length) {
      return new NextResponse(JSON.stringify({ error: "Dados incompletos" }), {
        status: 400,
      });
    }

    const total = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          clientName,
          clientPhone,
          total,
          userId: session.id,
          tenantId: session.tenantId,
          items: {
            create: items.map((item: any) => ({
              quantity: item.quantity,
              price: item.price,
              productId: item.productId,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) continue;

        const newQuantity = Math.max(0, product.quantity - item.quantity);
        const newStatus = newQuantity > 0 ? product.status : "fora de estoque";

        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: newQuantity,
            status: newStatus,
          },
        });
      }

      return newSale;
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return new NextResponse(JSON.stringify({ error: "Erro ao criar venda" }), {
      status: 500,
    });
  }
}
