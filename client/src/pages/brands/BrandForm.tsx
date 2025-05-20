import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertBrandSchema } from "@shared/schema";

// Extend the schema with form validation rules
const brandFormSchema = insertBrandSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

interface BrandFormProps {
  id?: number;
}

export default function BrandForm({ id }: BrandFormProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditMode = !!id;

  // Fetch brand data if in edit mode
  const { data: brand, isLoading } = useQuery({
    queryKey: ['/api/brands', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/brands/${id}`);
      if (!res.ok) throw new Error('Failed to fetch brand');
      return res.json();
    },
    enabled: isEditMode,
  });

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Update form when brand data is loaded
  useEffect(() => {
    if (brand) {
      form.reset(brand);
    }
  }, [brand, form]);

  const onSubmit = async (data: BrandFormValues) => {
    try {
      if (isEditMode) {
        await apiRequest('PUT', `/api/brands/${id}`, data);
        toast({
          title: 'Success',
          description: 'Brand updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/brands', data);
        toast({
          title: 'Success',
          description: 'Brand created successfully',
        });
      }
      
      // Invalidate the brands query and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      setLocation("/brands");
    } catch (error) {
      toast({
        title: 'Error',
        description: isEditMode ? 'Failed to update brand' : 'Failed to create brand',
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
        <Button variant="ghost" onClick={() => setLocation("/brands")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Brands
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Brand' : 'Add Brand'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Brand Information' : 'Brand Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field} />
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
                    isEditMode ? 'Update Brand' : 'Create Brand'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setLocation("/brands")}>
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
