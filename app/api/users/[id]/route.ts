import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcrypt";

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
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Usuário não encontrado" }),
        {
          status: 404,
        }
      );
    }

    if (user.tenantId !== session.tenantId && user.id !== session.id) {
      return new NextResponse(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
      });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao buscar usuário" }),
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
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingUser) {
      return new NextResponse(
        JSON.stringify({ error: "Usuário não encontrado" }),
        {
          status: 404,
        }
      );
    }

    const isAdmin = session.role === "administrador";
    const isSelf = session.id === params.id;

    if (!isAdmin && !isSelf) {
      return new NextResponse(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
      });
    }

    const { name, email, password, phone, role, photo } = await request.json();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email && isAdmin) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role && isAdmin) updateData.role = role;
    if (photo !== undefined) updateData.photo = photo;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao atualizar usuário" }),
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
  if (!session || session.role !== "administrador") {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingUser) {
      return new NextResponse(
        JSON.stringify({ error: "Usuário não encontrado" }),
        {
          status: 404,
        }
      );
    }

    if (existingUser.tenantId !== session.tenantId) {
      return new NextResponse(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
      });
    }

    if (existingUser.id === session.id) {
      return new NextResponse(
        JSON.stringify({ error: "Não é possível excluir seu próprio usuário" }),
        {
          status: 400,
        }
      );
    }

    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao excluir usuário" }),
      {
        status: 500,
      }
    );
  }
}
