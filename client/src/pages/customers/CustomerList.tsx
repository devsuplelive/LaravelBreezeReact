import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
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
import { Customer } from "@shared/schema";

export default function CustomerList() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/customers', page, pageSize, searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/customers?page=${page}&limit=${pageSize}&search=${searchTerm}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    }
  });

  const handleDelete = async () => {
    if (!deleteCustomerId) return;
    
    try {
      await apiRequest('DELETE', `/api/customers/${deleteCustomerId}`);
      
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setDeleteCustomerId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
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
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (row: Customer) => row.phone || "—",
    },
    {
      header: "City",
      accessorKey: "city",
      cell: (row: Customer) => row.city || "—",
    },
    {
      header: "State",
      accessorKey: "state",
      cell: (row: Customer) => row.state || "—",
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: Customer) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/customers/${row.id}`);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteCustomerId(row.id);
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
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => setLocation("/customers/new")}>
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      <DataTable
        data={data?.customers || []}
        columns={columns}
        onSearch={handleSearch}
        searchPlaceholder="Search customers..."
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
        onRowClick={(row) => setLocation(`/customers/${row.id}`)}
      />

      <AlertDialog open={!!deleteCustomerId} onOpenChange={() => setDeleteCustomerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer and related records.
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
