"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { saleService } from "@/services/api";

interface SaleItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Sale {
  id: string;
  clientName: string;
  clientPhone: string | null;
  total: number;
  createdAt: string;
  user: {
    name: string;
  };
  items: SaleItem[];
}

interface SaleListProps {
  tenantId: string;
}

export function SaleList({ tenantId }: SaleListProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSales = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await saleService.getAll();
      setSales(data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);

      setSales([
        {
          id: "1",
          clientName: "João Silva",
          clientPhone: "(11) 98765-4321",
          total: 150.0,
          createdAt: new Date().toISOString(),
          user: { name: "Vendedor 1" },
          items: [
            {
              id: "i1",
              quantity: 2,
              price: 50.0,
              product: { name: "Produto 1" },
            },
            {
              id: "i2",
              quantity: 1,
              price: 50.0,
              product: { name: "Produto 2" },
            },
          ],
        },
        {
          id: "2",
          clientName: "Maria Oliveira",
          clientPhone: "(11) 91234-5678",
          total: 75.0,
          createdAt: new Date().toISOString(),
          user: { name: "Vendedor 2" },
          items: [
            {
              id: "i3",
              quantity: 3,
              price: 25.0,
              product: { name: "Produto 3" },
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    const handleSaleUpdate = () => {
      fetchSales();
    };

    window.addEventListener("sale-updated", handleSaleUpdate);

    return () => {
      window.removeEventListener("sale-updated", handleSaleUpdate);
    };
  }, [fetchSales]);

  const filteredSales = sales.filter((sale) =>
    sale.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    fetchSales();
  };

  if (loading) {
    return <div className="py-10 text-center">Carregando vendas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Atualizar lista"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Vendedor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Nenhuma venda encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.clientName}</TableCell>
                  <TableCell>{sale.clientPhone || "-"}</TableCell>
                  <TableCell>R$ {sale.total.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(sale.createdAt)}</TableCell>
                  <TableCell>{sale.user.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <h3 className="text-xl font-medium mt-8">Detalhes das Vendas</h3>
      <Accordion type="single" collapsible className="w-full">
        {filteredSales.map((sale) => (
          <AccordionItem key={sale.id} value={sale.id}>
            <AccordionTrigger>
              {sale.clientName} - R$ {sale.total.toFixed(2)} (
              {formatDate(sale.createdAt)})
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        R$ {(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
