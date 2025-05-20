import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { BarChart, Users, Box, ShoppingCart, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Chart placeholder component
const ChartPlaceholder = () => (
  <div className="h-60 flex justify-center items-center text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
    <div>
      <BarChart className="mx-auto h-12 w-12 mb-2 text-gray-400" />
      <p>Chart placeholder - sales by category</p>
      <p className="text-sm text-gray-400 mt-1">Data visualization would render here.</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Fetch dashboard stats
  const { data: stats = { customers: 0, products: 0, orders: 0, revenue: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: 1
  });

  // Fetch recent orders
  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/dashboard/recent-orders'],
    retry: 1
  });

  // Fetch top products
  const { data: topProducts = [], isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['/api/dashboard/top-products'],
    retry: 1
  });

  // Fetch sales by category
  const { data: salesByCategory = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ['/api/dashboard/sales-by-category'],
    retry: 1
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check your business at a glance.</p>
      </div>

      {/* Dashboard stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Customers stat */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-md p-3">
                  <Users className="text-primary-600 dark:text-primary-300 text-xl" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Customers</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {(stats?.customers || 0).toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-4 sm:px-6">
              <Button 
                variant="link" 
                className="text-primary-600 dark:text-primary-400 p-0 h-auto font-medium"
                onClick={() => setLocation("/customers")}
              >
                View all customers <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products stat */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-md p-3">
                  <Box className="text-indigo-600 dark:text-indigo-300 text-xl" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Products</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {(stats?.products || 0).toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-4 sm:px-6">
              <Button 
                variant="link" 
                className="text-indigo-600 dark:text-indigo-400 p-0 h-auto font-medium"
                onClick={() => setLocation("/products")}
              >
                View all products <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders stat */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900 rounded-md p-3">
                  <ShoppingCart className="text-amber-600 dark:text-amber-300 text-xl" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Orders</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {(stats?.orders || 0).toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-4 sm:px-6">
              <Button 
                variant="link" 
                className="text-amber-600 dark:text-amber-400 p-0 h-auto font-medium"
                onClick={() => setLocation("/orders")}
              >
                View all orders <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Revenue stat */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                  <DollarSign className="text-green-600 dark:text-green-300 text-xl" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Revenue</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(stats?.revenue || 0)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-4 sm:px-6">
              <Button 
                variant="link" 
                className="text-green-600 dark:text-green-400 p-0 h-auto font-medium"
                onClick={() => setLocation("/orders")}
              >
                View financial reports <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Recent Orders</h3>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setLocation("/orders/new")}
              >
                Create Order
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <DataTable
              data={recentOrders || []}
              columns={[
                {
                  header: "Order ID",
                  accessorKey: "orderNumber",
                  cell: (row) => (
                    <div className="font-medium">{row.orderNumber}</div>
                  ),
                },
                {
                  header: "Customer",
                  accessorKey: (row) => row.customer?.name,
                },
                {
                  header: "Status",
                  accessorKey: "status",
                  cell: (row) => {
                    const statusClass = `status-${row.status}`;
                    return <span className={statusClass}>{row.status}</span>;
                  },
                },
                {
                  header: "Date",
                  accessorKey: "orderedAt",
                  cell: (row) => new Date(row.orderedAt).toLocaleDateString(),
                },
                {
                  header: "Amount",
                  accessorKey: "totalAmount",
                  cell: (row) => new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(Number(row.totalAmount)),
                },
                {
                  header: "Actions",
                  accessorKey: "id",
                  cell: (row) => (
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setLocation(`/orders/${row.id}`)}
                      >
                        <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setLocation(`/orders/${row.id}/edit`)}
                      >
                        <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </Button>
                    </div>
                  ),
                },
              ]}
              isLoading={ordersLoading}
              onRowClick={(row) => setLocation(`/orders/${row.id}`)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout for additional stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Top Selling Products</h3>
            </div>
            <div className="p-6">
              {productsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="ml-4 flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : productsError ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Não foi possível carregar os dados de produtos no momento
                </div>
              ) : topProducts?.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {topProducts.map((product: any) => (
                    <li key={product.id} className="py-4 flex">
                      <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 h-16 w-16 rounded-md overflow-hidden flex items-center justify-center text-gray-400">
                        <Box className="h-8 w-8" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</h4>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(Number(product.price))}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="truncate">{product.totalSold} units sold</span>
                          <span className="mx-1">&middot;</span>
                          <span>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(Number(product.revenue))} revenue
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                            style={{ width: `${(product.totalSold / topProducts[0].totalSold) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No product sales data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Sales by Category</h3>
            </div>
            <div className="p-6">
              {/* Chart placeholder - in a real app this would be a real chart */}
              <ChartPlaceholder />
              
              {categoriesLoading ? (
                <div className="mt-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : salesByCategory?.length > 0 ? (
                <ul className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">
                  {salesByCategory.map((category: any, index: number) => {
                    // Generate a color based on index
                    const colors = ["primary", "indigo", "amber", "green", "gray"];
                    const colorClass = colors[index % colors.length];
                    
                    return (
                      <li key={category.categoryName} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full bg-${colorClass}-500 mr-3`}></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{category.categoryName}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(Number(category.amount))}
                          </span>
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                            ({category.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No category sales data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
