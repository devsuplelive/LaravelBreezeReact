import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
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
import { Product, ProductWithRelations } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function ProductList() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/products', page, pageSize, searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/products?page=${page}&limit=${pageSize}&search=${searchTerm}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  const handleDelete = async () => {
    if (!deleteProductId) return;
    
    try {
      await apiRequest('DELETE', `/api/products/${deleteProductId}`);
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setDeleteProductId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product. It may be used in orders.',
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
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "SKU",
      accessorKey: "sku",
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (row: Product) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(Number(row.price));
      },
    },
    {
      header: "Stock",
      accessorKey: "stock",
      cell: (row: Product) => {
        if (row.stock <= 0) {
          return <Badge variant="destructive">Out of Stock</Badge>;
        } else if (row.stock < 10) {
          return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">Low: {row.stock}</Badge>;
        } else {
          return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">{row.stock}</Badge>;
        }
      },
    },
    {
      header: "Brand",
      accessorKey: (row: ProductWithRelations) => row.brand?.name || "—",
    },
    {
      header: "Category",
      accessorKey: (row: ProductWithRelations) => row.category?.name || "—",
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: Product) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/products/${row.id}`);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteProductId(row.id);
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
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setLocation("/products/new")}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <DataTable
        data={data?.products || []}
        columns={columns}
        onSearch={handleSearch}
        searchPlaceholder="Search products by name, SKU, or description..."
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
        onRowClick={(row) => setLocation(`/products/${row.id}`)}
      />

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and may affect orders that contain it.
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
