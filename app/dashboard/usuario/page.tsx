import { UserProfile } from "@/components/user-profile";
import { UserManagement } from "@/components/user-management";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UsuarioPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  const isAdmin = session.role === "administrador";
  const users = isAdmin
    ? await prisma.user.findMany({
        where: { tenantId: session.tenantId },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Perfil de Usuário</h1>
      <UserProfile user={user} />

      {isAdmin && (
        <>
          <h2 className="text-2xl font-bold mt-12">Gerenciar Usuários</h2>
          <UserManagement users={users} tenantId={session.tenantId} />
        </>
      )}
    </div>
  );
}
