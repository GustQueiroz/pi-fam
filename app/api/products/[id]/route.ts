import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
    });
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!product) {
      return new NextResponse(
        JSON.stringify({ error: "Produto não encontrado" }),
        {
          status: 404,
        }
      );
    }

    if (product.tenantId !== session.tenantId) {
      return new NextResponse(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao buscar produto" }),
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
    });
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingProduct) {
      return new NextResponse(
        JSON.stringify({ error: "Produto não encontrado" }),
        {
          status: 404,
        }
      );
    }

    if (existingProduct.tenantId !== session.tenantId) {
      return new NextResponse(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
      });
    }

    const { name, quantity, price, cost, status, image } = await request.json();

    let updatedStatus = status;
    if (quantity !== undefined) {
      if (quantity <= 0) {
        updatedStatus = "fora de estoque";
      } else if (!status || status === "fora de estoque") {
        updatedStatus = "ativo";
      }
    }

    const product = await prisma.product.update({
      where: {
        id: params.id,
      },
      data: {
        ...(name && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(price !== undefined && { price }),
        ...(cost !== undefined && { cost }),
        ...(image !== undefined && { image }),
        ...(updatedStatus && { status: updatedStatus }),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao atualizar produto" }),
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
    });
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingProduct) {
      return new NextResponse(
        JSON.stringify({ error: "Produto não encontrado" }),
        {
          status: 404,
        }
      );
    }

    if (existingProduct.tenantId !== session.tenantId) {
      return new NextResponse(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
      });
    }

    await prisma.product.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao excluir produto" }),
      {
        status: 500,
      }
    );
  }
}
