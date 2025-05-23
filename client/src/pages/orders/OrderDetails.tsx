import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Define the types we need for our component
interface OrderItem {
  id: number;
  price: number;
  quantity: number;
  total: number;
  product?: {
    name: string;
    sku: string;
  };
}

interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  transactionCode?: string;
}

interface Shipping {
  id: number;
  carrier?: string;
  trackingCode?: string;
  shippedAt?: string;
  deliveredAt?: string;
  shippingStatus: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  discount?: number;
  shippingCost?: number;
  orderedAt: string;
  paymentMethod?: string;
  notes?: string;
  customer?: Customer;
  orderItems?: OrderItem[];
  payments?: Payment[];
  shipping?: Shipping[];
}

export default function OrderDetails() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();

  // Fetch order data
  const { data: order, isLoading } = useQuery({
    queryKey: ['/api/orders', id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order not found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">The order you're looking for doesn't exist or was deleted.</p>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/orders")} 
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/orders")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setLocation(`/orders/${id}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit Order
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Status</h3>
                  <Badge className={`status-${order.status} mt-1`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-medium">Date</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(order.orderedAt)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Quantity</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems?.map((item: any) => (
                        <tr key={item.id} className="border-b dark:border-gray-700">
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                            <div className="text-sm text-gray-500">SKU: {item.product?.sku || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 text-right">{formatCurrency(Number(item.price))}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(item.total))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {formatCurrency(
                      order.orderItems?.reduce(
                        (sum: number, item: any) => sum + Number(item.total), 
                        0
                      ) || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>- {formatCurrency(Number(order.discount) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(Number(order.shippingCost) || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.totalAmount))}</span>
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notes</h3>
                    <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {order.notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer and Payment Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">{order.customer?.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{order.customer?.email}</p>
                {order.customer?.phone && (
                  <p className="text-gray-600 dark:text-gray-400">{order.customer?.phone}</p>
                )}
                {order.customer?.address && (
                  <div className="mt-3 pt-3 border-t dark:border-gray-700">
                    <p className="text-gray-800 dark:text-gray-200">{order.customer.address}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {[
                        order.customer.city,
                        order.customer.state,
                        order.customer.zipCode
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {order.paymentMethod ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Method:</span>
                    <span>{order.paymentMethod.replace('_', ' ').split(' ').map((word: string) => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}</span>
                  </div>
                  
                  {order.payments?.length > 0 ? (
                    <>
                      <Separator className="my-3" />
                      <h4 className="font-medium mb-2">Payment History</h4>
                      <div className="space-y-2">
                        {order.payments.map((payment: any) => (
                          <div key={payment.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <div className="flex justify-between">
                              <span>{formatDate(payment.paymentDate)}</span>
                              <span className="font-medium">{formatCurrency(Number(payment.amount))}</span>
                            </div>
                            {payment.transactionCode && (
                              <div className="text-sm text-gray-500 mt-1">
                                Transaction: {payment.transactionCode}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-amber-600 dark:text-amber-400 mt-2">No payment records found</p>
                  )}
                </div>
              ) : (
                <p className="text-amber-600 dark:text-amber-400">No payment method selected</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping?.length > 0 ? (
                <div className="space-y-3">
                  {order.shipping.map((shipping: any) => (
                    <div key={shipping.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Status</h4>
                        <Badge className={`status-${shipping.shippingStatus}`}>
                          {shipping.shippingStatus}
                        </Badge>
                      </div>
                      
                      {shipping.carrier && (
                        <div className="flex justify-between">
                          <span>Carrier:</span>
                          <span>{shipping.carrier}</span>
                        </div>
                      )}
                      
                      {shipping.trackingCode && (
                        <div className="flex justify-between">
                          <span>Tracking:</span>
                          <span className="font-mono">{shipping.trackingCode}</span>
                        </div>
                      )}
                      
                      {shipping.shippedAt && (
                        <div className="flex justify-between">
                          <span>Shipped:</span>
                          <span>{formatDate(shipping.shippedAt)}</span>
                        </div>
                      )}
                      
                      {shipping.deliveredAt && (
                        <div className="flex justify-between">
                          <span>Delivered:</span>
                          <span>{formatDate(shipping.deliveredAt)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-amber-600 dark:text-amber-400">No shipping information available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}