"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardChartsProps {
  tenantId: string;
}

export function DashboardCharts({ tenantId }: DashboardChartsProps) {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockSalesData = [
      { name: "Jan", vendas: 400, produtos: 24 },
      { name: "Fev", vendas: 300, produtos: 13 },
      { name: "Mar", vendas: 500, produtos: 22 },
      { name: "Abr", vendas: 280, produtos: 19 },
      { name: "Mai", vendas: 590, produtos: 32 },
      { name: "Jun", vendas: 390, produtos: 21 },
    ];

    const mockProfitData = [
      { name: "Jan", receita: 400, custo: 240, lucro: 160 },
      { name: "Fev", receita: 300, custo: 180, lucro: 120 },
      { name: "Mar", receita: 500, custo: 300, lucro: 200 },
      { name: "Abr", receita: 280, custo: 168, lucro: 112 },
      { name: "Mai", receita: 590, custo: 354, lucro: 236 },
      { name: "Jun", receita: 390, custo: 234, lucro: 156 },
    ];

    setSalesData(mockSalesData);
    setProfitData(mockProfitData);
    setIsLoading(false);
  }, [tenantId]);

  if (isLoading) {
    return <div className="py-10 text-center">Carregando gráficos...</div>;
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="analytics">Análise</TabsTrigger>
        <TabsTrigger value="profit">Lucro</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Mensais</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendas" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="produtos" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="profit" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Análise de Lucro</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="receita" fill="#8884d8" name="Receita" />
                <Bar dataKey="custo" fill="#82ca9d" name="Custo" />
                <Bar dataKey="lucro" fill="#ff7300" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
