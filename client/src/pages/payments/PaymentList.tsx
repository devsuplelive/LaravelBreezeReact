import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search, Edit, Trash2 } from "lucide-react";
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
interface PaymentResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

// Interface para um pagamento
interface Payment {
  id: number;
  orderId: number;
  paymentDate: string;
  paymentMethod: string;
  transactionCode: string;
  amount: string | number;
  order?: {
    orderNumber: string;
  };
}

export default function PaymentList() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = React.useState("");

  // Fetch payments data
  const { data, isLoading } = useQuery<PaymentResponse>({
    queryKey: ['/api/payments'],
    queryFn: async () => {
      const res = await fetch('/api/payments');
      if (!res.ok) throw new Error('Failed to fetch payments');
      return res.json();
    }
  });

  // Filter payments based on search term
  const filteredPayments = React.useMemo(() => {
    if (!data || !data.payments) return [];
    
    return data.payments.filter((payment: Payment) => 
      payment.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            <CardTitle>Pagamentos</CardTitle>
          </div>
          <Button onClick={() => setLocation("/payments/new")}>
            <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar pagamentos..."
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
                  <TableHead>Data</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Código Transação</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-medium"
                          onClick={() => setLocation(`/orders/${payment.orderId}`)}
                        >
                          {payment.order?.orderNumber || `Pedido #${payment.orderId}`}
                        </Button>
                      </TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.paymentMethod.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.transactionCode || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(payment.amount))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setLocation(`/payments/${payment.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchTerm ? 'Nenhum pagamento encontrado para sua busca.' : 'Nenhum pagamento encontrado.'}
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