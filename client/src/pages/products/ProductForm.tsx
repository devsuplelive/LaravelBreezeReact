import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProductSchema } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extend the schema with form validation rules
const productFormSchema = insertProductSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than zero"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  brandId: z.coerce.number().nullable().optional(),
  categoryId: z.coerce.number().nullable().optional(),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  id?: number;
}

export default function ProductForm({ id }: ProductFormProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditMode = !!id;

  // Fetch product data if in edit mode
  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
    enabled: isEditMode,
  });

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const res = await fetch('/api/brands?limit=100');
      if (!res.ok) throw new Error('Failed to fetch brands');
      return res.json();
    }
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories?limit=100');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      stock: 0,
      brandId: null,
      categoryId: null,
      description: "",
    },
  });

  // Update form when product data is loaded
  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        brandId: product.brandId || null,
        categoryId: product.categoryId || null,
      });
    }
  }, [product, form]);

  const onSubmit = async (data: ProductFormValues) => {
    // Convert empty strings to null for optional fields
    const formData = {
      ...data,
      brandId: data.brandId || null,
      categoryId: data.categoryId || null,
      description: data.description || null,
    };

    try {
      if (isEditMode) {
        await apiRequest('PUT', `/api/products/${id}`, formData);
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/products', formData);
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      }
      
      // Invalidate the products query and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setLocation("/products");
    } catch (error) {
      toast({
        title: 'Error',
        description: isEditMode ? 'Failed to update product' : 'Failed to create product',
        variant: 'destructive',
      });
    }
  };

  if (isEditMode && isProductLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/products")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Product Information' : 'Product Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product SKU" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {brandsData?.brands?.map((brand: { id: number; name: string }) => (
                            <SelectItem key={brand.id} value={brand.id.toString()}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {categoriesData?.categories?.map((category: { id: number; name: string }) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter product description" 
                        className="resize-none" 
                        rows={4}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="px-0 pt-6">
                <Button type="submit" className="mr-2">
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Product' : 'Create Product'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setLocation("/products")}>
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
