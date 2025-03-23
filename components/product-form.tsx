"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct } from "@/lib/actions";

interface ProductFormProps {
  tenantId: string;
}

export function ProductForm({ tenantId }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [custo, setCusto] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProduct({
        name,
        quantity,
        price,
        custo,
        tenantId,
      });

      setName("");
      setQuantity(0);
      setPrice(0);
      setCusto(0);
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar produto:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Produto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do produto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custo">Custo</Label>
              <Input
                id="custo"
                type="number"
                min="0"
                value={custo}
                onChange={(e) => setCusto(Number.parseInt(e.target.value))}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Produto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
