"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function createProduct({
  name,
  quantity,
  tenantId,
}: {
  name: string;
  quantity: number;
  tenantId: string;
}) {
  await requireAuth();

  const status = quantity > 0 ? "ativo" : "fora de estoque";

  await prisma.product.create({
    data: {
      name,
      quantity,
      status,
      tenantId,
    },
  });

  revalidatePath("/dashboard/estoque");
}

export async function updateProduct({
  id,
  name,
  quantity,
  status,
}: {
  id: string;
  name?: string;
  quantity?: number;
  status?: string;
}) {
  await requireAuth();

  let updatedStatus = status;
  if (quantity !== undefined) {
    if (quantity <= 0) {
      updatedStatus = "fora de estoque";
    } else if (!status || status === "fora de estoque") {
      updatedStatus = "ativo";
    }
  }

  await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(quantity !== undefined && { quantity }),
      ...(updatedStatus && { status: updatedStatus }),
    },
  });

  revalidatePath("/dashboard/estoque");
}

export async function deleteProduct(id: string) {
  await requireAuth();

  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/dashboard/estoque");
}

export async function createSale({
  clientName,
  clientPhone,
  items,
  tenantId,
}: {
  clientName: string;
  clientPhone?: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  tenantId: string;
}) {
  const session = await requireAuth();

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        clientName,
        clientPhone,
        total,
        userId: session.id,
        tenantId,
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
          })),
        },
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

  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard/estoque");
  return sale;
}

export async function createUser({
  name,
  email,
  password,
  phone,
  role,
  tenantId,
}: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "administrador" | "usuario";
  tenantId: string;
}) {
  await requireAdmin();

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      tenantId,
    },
  });

  revalidatePath("/dashboard/usuario");
}

export async function updateUser({
  id,
  name,
  email,
  phone,
  role,
}: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: "administrador" | "usuario";
}) {
  await requireAdmin();

  await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(role && { role }),
    },
  });

  revalidatePath("/dashboard/usuario");
}

export async function deleteUser(id: string) {
  await requireAdmin();

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/dashboard/usuario");
}
