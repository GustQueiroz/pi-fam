"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { deleteProduct, updateProduct } from "@/lib/actions";

interface Product {
  id: string;
  name: string;
  quantity: number;
  status: string;
}

interface ProductListProps {
  tenantId: string;
  statusFilter: string;
}

export function ProductList({ tenantId, statusFilter }: ProductListProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState(0);
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(
          `/api/products?tenantId=${tenantId}&status=${statusFilter}`
        );
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setProducts([
          { id: "1", name: "mock1", quantity: 10, status: "ativo" },
          { id: "2", name: "mock2", quantity: 5, status: "ativo" },
          {
            id: "3",
            name: "mock3",
            quantity: 0,
            status: "fora de estoque",
          },
          { id: "4", name: "mock2", quantity: 8, status: "inativo" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [tenantId, statusFilter]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditName(product.name);
    setEditQuantity(product.quantity);
    setEditStatus(product.status);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateProduct({
        id,
        name: editName,
        quantity: editQuantity,
        status: editStatus,
      });

      setProducts(
        products.map((p) =>
          p.id === id
            ? {
                ...p,
                name: editName,
                quantity: editQuantity,
                status: editStatus,
              }
            : p
        )
      );

      setEditingProduct(null);
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
        router.refresh();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "inativo":
        return <Badge variant="outline">Inativo</Badge>;
      case "fora de estoque":
        return <Badge variant="destructive">Fora de estoque</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="py-10 text-center">Carregando produtos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            router.push(`/dashboard/estoque?status=${value}`)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
            <SelectItem value="fora de estoque">Fora de estoque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      product.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        type="number"
                        min="0"
                        value={editQuantity}
                        onChange={(e) =>
                          setEditQuantity(Number.parseInt(e.target.value))
                        }
                      />
                    ) : (
                      product.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="fora de estoque">
                            Fora de estoque
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(product.status)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingProduct === product.id ? (
                      <Button onClick={() => handleSaveEdit(product.id)}>
                        Salvar
                      </Button>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
