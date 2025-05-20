import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "../../lib/queryClient";
import { Separator } from "@/components/ui/separator";

// Shipping status options
const SHIPPING_STATUS = [
  "pending",
  "shipped",
  "delivered",
  "returned"
];

interface ShippingFormProps {
  id?: number;
}

export default function ShippingForm({ id }: ShippingFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditMode = !!id;

  // Define shipping form schema
  const formSchema = z.object({
    orderId: z.string().min(1, "Order is required"),
    carrier: z.string().optional(),
    trackingCode: z.string().optional(),
    shippedAt: z.string().optional(),
    deliveredAt: z.string().optional(),
    shippingStatus: z.string().min(1, "Shipping status is required"),
  });

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: "",
      carrier: "",
      trackingCode: "",
      shippedAt: "",
      deliveredAt: "",
      shippingStatus: "pending",
    },
  });

  // Fetch orders for dropdown
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    }
  });

  // Fetch shipping data if in edit mode
  const { data: shipping, isLoading: shippingLoading } = useQuery({
    queryKey: ['/api/shipping', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/shipping/${id}`);
      if (!res.ok) throw new Error('Failed to fetch shipping');
      return res.json();
    },
    enabled: !!id,
  });

  // Set form values when shipping data is loaded
  React.useEffect(() => {
    if (shipping) {
      form.reset({
        orderId: String(shipping.orderId),
        carrier: shipping.carrier || "",
        trackingCode: shipping.trackingCode || "",
        shippedAt: shipping.shippedAt ? new Date(shipping.shippedAt).toISOString().split('T')[0] : "",
        deliveredAt: shipping.deliveredAt ? new Date(shipping.deliveredAt).toISOString().split('T')[0] : "",
        shippingStatus: shipping.shippingStatus,
      });
    }
  }, [shipping, form]);

  // Create or update shipping
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const endpoint = isEditMode ? `/api/shipping/${id}` : '/api/shipping';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const payload = {
        ...values,
        orderId: parseInt(values.orderId),
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save shipping');
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isEditMode ? "Shipping updated" : "Shipping created",
        description: isEditMode 
          ? "Shipping has been updated successfully." 
          : "New shipping has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shipping'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setLocation("/shipping");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  // Show loading state
  if ((isEditMode && shippingLoading) || ordersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/shipping")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shipping
        </Button>
        
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Shipping" : "New Shipping"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <Select
                        disabled={mutation.isPending || isEditMode}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orders?.map((order: any) => (
                            <SelectItem key={order.id} value={String(order.id)}>
                              {order.orderNumber} - {order.customer?.name}
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
                  name="shippingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        disabled={mutation.isPending}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SHIPPING_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
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
                  name="carrier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrier</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          placeholder="e.g. FedEx, UPS, USPS"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trackingCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Code</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          placeholder="Tracking number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipped Date</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveredAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivered Date</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Shipping" : "Create Shipping"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}