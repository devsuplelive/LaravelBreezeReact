import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUS, PAYMENT_METHODS } from "@shared/constants";

// Combine schemas for form
const orderFormSchema = z.object({
  order: insertOrderSchema.extend({
    customerId: z.coerce.number(),
    orderNumber: z.string().min(1, "Order number is required"),
    status: z.enum(Object.values(ORDER_STATUS) as [string, ...string[]]),
    totalAmount: z.coerce.number().min(0.01, "Total amount must be greater than zero"),
    discount: z.coerce.number().default(0),
    shippingCost: z.coerce.number().default(0),
    paymentMethod: z.enum(Object.values(PAYMENT_METHODS) as [string, ...string[]]).optional().nullable(),
    notes: z.string().optional(),
    orderedAt: z.date(),
  }),
  items: z.array(
    insertOrderItemSchema.omit({ orderId: true }).extend({
      productId: z.coerce.number(),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      price: z.coerce.number().min(0.01, "Price must be greater than zero"),
      total: z.coerce.number().min(0.01, "Total must be greater than zero"),
    })
  ).min(1, "At least one item is required"),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  id?: number;
}

export default function OrderForm({ id }: OrderFormProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditMode = !!id;
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch order data if in edit mode
  const { data: orderData, isLoading: isOrderLoading } = useQuery({
    queryKey: ['/api/orders', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      return res.json();
    },
    enabled: isEditMode,
  });

  // Fetch customers
  const { data: customersData } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers?limit=100');
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    }
  });

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await fetch('/api/products?limit=100');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  const defaultValues: OrderFormValues = {
    order: {
      customerId: 0,
      orderNumber: generateOrderNumber(),
      status: ORDER_STATUS.PENDING,
      totalAmount: 0,
      discount: 0,
      shippingCost: 0,
      paymentMethod: null,
      notes: '',
      orderedAt: new Date(),
    },
    items: [
      {
        productId: 0,
        quantity: 1,
        price: 0,
        total: 0,
      },
    ],
  };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Update form when order data is loaded
  useEffect(() => {
    if (orderData) {
      form.reset({
        order: {
          ...orderData,
          orderedAt: new Date(orderData.orderedAt),
        },
        items: orderData.orderItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      });
    }
  }, [orderData, form]);

  // Calculate totals when items, discount, or shipping change
  const calculateTotals = async () => {
    setIsCalculating(true);
    try {
      const items = form.getValues("items");
      let subtotal = 0;
      
      // Update each item's total and calculate subtotal
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const total = Number(item.quantity) * Number(item.price);
        form.setValue(`items.${i}.total`, total);
        subtotal += total;
      }
      
      // Get discount and shipping cost
      const discount = Number(form.getValues("order.discount")) || 0;
      const shippingCost = Number(form.getValues("order.shippingCost")) || 0;
      
      // Calculate final total
      const totalAmount = subtotal - discount + shippingCost;
      form.setValue("order.totalAmount", totalAmount);
    } finally {
      setIsCalculating(false);
    }
  };

  // Generate a new order number
  function generateOrderNumber() {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}${randomChars}`;
  }

  // When a product is selected, fetch its current price
  const handleProductChange = async (index: number, productId: number) => {
    if (!productId) return;
    
    const products = productsData?.products || [];
    const product = products.find((p: any) => p.id === productId);
    
    if (product) {
      form.setValue(`items.${index}.price`, Number(product.price));
      form.setValue(`items.${index}.total`, Number(product.price) * form.getValues(`items.${index}.quantity`));
      calculateTotals();
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      if (isEditMode) {
        await apiRequest('PUT', `/api/orders/${id}`, data.order);
        
        // For now, the API doesn't support updating order items in bulk
        // In a real app, you would handle this case too
        
        toast({
          title: 'Success',
          description: 'Order updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/orders', data);
        toast({
          title: 'Success',
          description: 'Order created successfully',
        });
      }
      
      // Invalidate the orders query and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setLocation("/orders");
    } catch (error) {
      toast({
        title: 'Error',
        description: isEditMode ? 'Failed to update order' : 'Failed to create order',
        variant: 'destructive',
      });
    }
  };

  if (isEditMode && isOrderLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/orders")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Order' : 'Create Order'}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="order.customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={isEditMode}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customersData?.customers?.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
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
                  name="order.orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isEditMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order.status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ORDER_STATUS).map((status) => (
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
                  name="order.paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ""} 
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {Object.values(PAYMENT_METHODS).map((method) => (
                            <SelectItem key={method} value={method}>
                              {method.replace('_', ' ').split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
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
                  name="order.discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateTotals();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order.shippingCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Cost</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateTotals();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order.totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          disabled
                          className="font-semibold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order.notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Order notes" 
                          className="resize-none" 
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Items</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    append({
                      productId: 0,
                      quantity: 1,
                      price: 0,
                      total: 0,
                    });
                  }}
                  disabled={isEditMode}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </CardHeader>
              <CardContent>
                {fields.map((field, index) => (
                  <div key={field.id} className="mb-6 p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {!isEditMode && fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Select
                              value={field.value.toString()}
                              onValueChange={(value) => {
                                field.onChange(parseInt(value));
                                handleProductChange(index, parseInt(value));
                              }}
                              disabled={isEditMode}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {productsData?.products?.map((product: any) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name} - {new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: 'USD'
                                    }).format(Number(product.price))}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseInt(e.target.value, 10));
                                    calculateTotals();
                                  }}
                                  disabled={isEditMode}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                    calculateTotals();
                                  }}
                                  disabled={isEditMode}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.total`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  disabled
                                  className="font-medium bg-gray-50"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {isCalculating && (
                  <div className="text-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin inline-block mr-1" />
                    <span className="text-sm text-gray-500">Calculating...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setLocation("/orders")}>
              Cancel
            </Button>
            <Button type="submit">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating Order...' : 'Create Order'}
                </>
              ) : (
                isEditMode ? 'Update Order' : 'Create Order'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
