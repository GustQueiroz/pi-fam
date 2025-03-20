"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { saleService, productService } from "@/services/api";

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface SaleFormProps {
  products: Product[];
  tenantId: string;
}

export function SaleForm({
  products: initialProducts,
  tenantId,
}: SaleFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState([
    { productId: "", quantity: 1, price: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await productService.getAll("ativo");
        setProducts(data.filter((p) => p.quantity > 0));
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    }

    fetchProducts();

    const handleProductUpdate = () => {
      fetchProducts();
    };

    window.addEventListener("product-updated", handleProductUpdate);

    return () => {
      window.removeEventListener("product-updated", handleProductUpdate);
    };
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];

    if (field === "productId") {
      const selectedProduct = products.find((p) => p.id === value);
      if (selectedProduct) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          price: selectedProduct.price || 0,
        };
      } else {
        newItems[index] = { ...newItems[index], productId: value };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }

    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validItems = items.filter(
        (item) => item.productId && item.quantity > 0 && item.price > 0
      );

      if (validItems.length === 0) {
        alert("Adicione pelo menos um produto válido à venda");
        setLoading(false);
        return;
      }

      await saleService.create({
        clientName,
        clientPhone,
        items: validItems,
      });

      setClientName("");
      setClientPhone("");
      setItems([{ productId: "", quantity: 1, price: 0 }]);

      window.dispatchEvent(new Event("sale-updated"));
      window.dispatchEvent(new Event("product-updated"));
    } catch (error) {
      console.error("Erro ao criar venda:", error);
    } finally {
      setLoading(false);
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Nova Venda</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Itens da Venda</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end"
              >
                <div className="space-y-2 sm:col-span-2">
                  <Label>Produto</Label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) =>
                      handleItemChange(index, "productId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Estoque: {product.quantity}) - R${" "}
                          {product.price?.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        Number.parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "price",
                          Number.parseFloat(e.target.value)
                        )
                      }
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-medium">
              Total: R$ {total.toFixed(2)}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Venda"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
