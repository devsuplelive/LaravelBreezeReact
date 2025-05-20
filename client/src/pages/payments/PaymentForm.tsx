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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "../../lib/queryClient";
import { Separator } from "@/components/ui/separator";

// Payment methods from the backend
const PAYMENT_METHODS = [
  "credit_card",
  "debit_card",
  "bank_transfer",
  "paypal",
  "cash",
  "other"
];

interface PaymentFormProps {
  id?: number;
}

export default function PaymentForm({ id }: PaymentFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditMode = !!id;

  // Define payment form schema
  const formSchema = z.object({
    orderId: z.string().min(1, "Order is required"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    amount: z.string().min(1, "Amount is required"),
    paymentDate: z.string().min(1, "Payment date is required"),
    transactionCode: z.string().optional(),
  });

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: "",
      paymentMethod: "",
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      transactionCode: "",
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

  // Fetch payment data if in edit mode
  const { data: payment, isLoading: paymentLoading } = useQuery({
    queryKey: ['/api/payments', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/payments/${id}`);
      if (!res.ok) throw new Error('Failed to fetch payment');
      return res.json();
    },
    enabled: !!id,
  });

  // Set form values when payment data is loaded
  React.useEffect(() => {
    if (payment) {
      form.reset({
        orderId: String(payment.orderId),
        paymentMethod: payment.paymentMethod,
        amount: String(payment.amount),
        paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
        transactionCode: payment.transactionCode || "",
      });
    }
  }, [payment, form]);

  // Create or update payment
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const endpoint = isEditMode ? `/api/payments/${id}` : '/api/payments';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const payload = {
        ...values,
        orderId: parseInt(values.orderId),
        amount: parseFloat(values.amount),
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
        throw new Error(error.message || 'Failed to save payment');
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isEditMode ? "Payment updated" : "Payment created",
        description: isEditMode 
          ? "Payment has been updated successfully." 
          : "New payment has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setLocation("/payments");
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
  if ((isEditMode && paymentLoading) || ordersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/payments")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Payments
        </Button>
        
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Payment" : "New Payment"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
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
                        disabled={mutation.isPending}
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
                              {order.orderNumber} - ${order.totalAmount}
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
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        disabled={mutation.isPending}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method.replace('_', ' ')}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
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
                  name="transactionCode"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Transaction Code</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          placeholder="Transaction reference number"
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
                  {isEditMode ? "Update Payment" : "Create Payment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}