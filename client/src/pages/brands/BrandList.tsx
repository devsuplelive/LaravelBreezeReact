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
import { Brand } from "@shared/schema";

export default function BrandList() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteBrandId, setDeleteBrandId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/brands', page, pageSize, searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/brands?page=${page}&limit=${pageSize}&search=${searchTerm}`);
      if (!res.ok) throw new Error('Failed to fetch brands');
      return res.json();
    }
  });

  const handleDelete = async () => {
    if (!deleteBrandId) return;
    
    try {
      await apiRequest('DELETE', `/api/brands/${deleteBrandId}`);
      
      toast({
        title: 'Success',
        description: 'Brand deleted successfully',
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      setDeleteBrandId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete brand. It may be in use by products.',
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
      header: "Created At",
      accessorKey: "createdAt",
      cell: (row: Brand) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Updated At",
      accessorKey: "updatedAt",
      cell: (row: Brand) => new Date(row.updatedAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: Brand) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/brands/${row.id}`);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteBrandId(row.id);
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
        <h1 className="text-2xl font-bold">Brands</h1>
        <Button onClick={() => setLocation("/brands/new")}>
          <Plus className="h-4 w-4 mr-2" /> Add Brand
        </Button>
      </div>

      <DataTable
        data={data?.brands || []}
        columns={columns}
        onSearch={handleSearch}
        searchPlaceholder="Search brands..."
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
        onRowClick={(row) => setLocation(`/brands/${row.id}`)}
      />

      <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              brand and may affect products associated with it.
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
