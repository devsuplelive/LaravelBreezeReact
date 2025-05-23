import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interface para a resposta da API
interface ShippingResponse {
  shippings: Shipping[];
  total: number;
  page: number;
  limit: number;
}

// Interface para um registro de envio
interface Shipping {
  id: number;
  orderId: number;
  carrier: string;
  trackingCode: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  shippingStatus: string;
  order?: {
    orderNumber: string;
  };
}

export default function ShippingList() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = React.useState("");

  // Fetch shipping data
  const { data, isLoading } = useQuery<ShippingResponse>({
    queryKey: ['/api/shipping'],
    queryFn: async () => {
      const res = await fetch('/api/shipping');
      if (!res.ok) throw new Error('Failed to fetch shipping data');
      return res.json();
    }
  });

  // Filter shipping based on search term
  const filteredShipping = React.useMemo(() => {
    if (!data || !data.shippings) return [];
    
    return data.shippings.filter((shipping: Shipping) => 
      shipping.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipping.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipping.carrier?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pendente</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Enviado</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Entregue</Badge>;
      case 'returned':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Devolvido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Entregas</CardTitle>
          </div>
          <Button onClick={() => setLocation("/shipping/new")}>
            <Plus className="mr-2 h-4 w-4" /> Nova Entrega
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar por pedido, rastreio, transportadora..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido #</TableHead>
                  <TableHead>Transportadora</TableHead>
                  <TableHead>Código de Rastreio</TableHead>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Data de Entrega</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipping.length > 0 ? (
                  filteredShipping.map((shipping: Shipping) => (
                    <TableRow key={shipping.id}>
                      <TableCell className="font-medium">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-medium"
                          onClick={() => setLocation(`/orders/${shipping.orderId}`)}
                        >
                          {shipping.order?.orderNumber || `Pedido #${shipping.orderId}`}
                        </Button>
                      </TableCell>
                      <TableCell>{shipping.carrier || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {shipping.trackingCode || "-"}
                      </TableCell>
                      <TableCell>{formatDate(shipping.shippedAt)}</TableCell>
                      <TableCell>{formatDate(shipping.deliveredAt)}</TableCell>
                      <TableCell>
                        {getStatusBadge(shipping.shippingStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setLocation(`/shipping/${shipping.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchTerm 
                        ? 'Nenhum registro de entrega encontrado para sua busca.' 
                        : 'Nenhum registro de entrega encontrado.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}