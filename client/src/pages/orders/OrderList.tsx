import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderWithRelations } from "@shared/schema";

export default function OrderList() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/orders', page, pageSize, searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/orders?page=${page}&limit=${pageSize}&search=${searchTerm}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    }
  });

  const handleDelete = async () => {
    if (!deleteOrderId) return;
    
    try {
      await apiRequest('DELETE', `/api/orders/${deleteOrderId}`);
      
      toast({
        title: 'Success',
        description: 'Order deleted successfully',
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setDeleteOrderId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete order',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
  };

  const columns = [
    {
      header: "Order #",
      accessorKey: "orderNumber",
    },
    {
      header: "Customer",
      accessorKey: (row: OrderWithRelations) => row.customer?.name,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: OrderWithRelations) => {
        const statusClass = `status-${row.status}`;
        return <span className={statusClass}>{row.status}</span>;
      },
    },
    {
      header: "Date",
      accessorKey: "orderedAt",
      cell: (row: OrderWithRelations) => new Date(row.orderedAt).toLocaleDateString(),
    },
    {
      header: "Total",
      accessorKey: "totalAmount",
      cell: (row: OrderWithRelations) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(Number(row.totalAmount));
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: OrderWithRelations) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/orders/${row.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOrderId(row.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button onClick={() => setLocation("/orders/new")}>
          <Plus className="h-4 w-4 mr-2" /> Create Order
        </Button>
      </div>

      <DataTable
        data={data?.orders || []}
        columns={columns}
        onSearch={handleSearch}
        searchPlaceholder="Search orders by number or notes..."
        pagination={{
          pageIndex: page - 1,
          pageCount: Math.ceil((data?.total || 0) / pageSize),
          pageSize,
          onPageChange: (newPage) => setPage(newPage + 1),
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setPage(1);
          },
        }}
        isLoading={isLoading}
        onRefresh={refetch}
        onRowClick={(row) => setLocation(`/orders/${row.id}`)}
      />

      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order and all related data including order items, payments and shipping information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
