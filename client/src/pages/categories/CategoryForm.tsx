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
import { insertCategorySchema } from "@shared/schema";

// Extend the schema with form validation rules
const categoryFormSchema = insertCategorySchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  id?: number;
}

export default function CategoryForm({ id }: CategoryFormProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditMode = !!id;

  // Fetch category data if in edit mode
  const { data: category, isLoading } = useQuery({
    queryKey: ['/api/categories', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/categories/${id}`);
      if (!res.ok) throw new Error('Failed to fetch category');
      return res.json();
    },
    enabled: isEditMode,
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Update form when category data is loaded
  useEffect(() => {
    if (category) {
      form.reset(category);
    }
  }, [category, form]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (isEditMode) {
        await apiRequest('PUT', `/api/categories/${id}`, data);
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/categories', data);
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
      }
      
      // Invalidate the categories query and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setLocation("/categories");
    } catch (error) {
      toast({
        title: 'Error',
        description: isEditMode ? 'Failed to update category' : 'Failed to create category',
        variant: 'destructive',
      });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/categories")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Categories
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Category' : 'Add Category'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Category Information' : 'Category Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter category description" 
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
                    isEditMode ? 'Update Category' : 'Create Category'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setLocation("/categories")}>
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
