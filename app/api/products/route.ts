import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const products = await prisma.product.findMany({
      where: {
        tenantId: session.tenantId,
        ...(status && status !== "todos" ? { status } : {}),
      },
      orderBy: [{ quantity: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao buscar produtos" }),
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
    const { name, quantity, price, cost, image } = await request.json();

    if (!name) {
      return new NextResponse(JSON.stringify({ error: "Nome é obrigatório" }), {
        status: 400,
      });
    }

    const status = quantity > 0 ? "ativo" : "fora de estoque";

    const product = await prisma.product.create({
      data: {
        name,
        quantity: quantity || 0,
        price: price || 0,
        cost: cost || 0,
        image,
        status,
        tenantId: session.tenantId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao criar produto" }),
      {
        status: 500,
      }
    );
  }
}
