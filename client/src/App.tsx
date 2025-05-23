import { Route, Switch } from "wouter";
import { useAuth } from "./providers/AuthProvider";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/not-found";
import AppLayout from "./components/layouts/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import CustomerList from "./pages/customers/CustomerList";
import CustomerForm from "./pages/customers/CustomerForm";
import BrandList from "./pages/brands/BrandList";
import BrandForm from "./pages/brands/BrandForm";
import CategoryList from "./pages/categories/CategoryList";
import CategoryForm from "./pages/categories/CategoryForm";
import ProductList from "./pages/products/ProductList";
import ProductForm from "./pages/products/ProductForm";
import OrderList from "./pages/orders/OrderList";
import OrderForm from "./pages/orders/OrderForm";
import OrderDetails from "./pages/orders/OrderDetails";
import PaymentList from "./pages/payments/PaymentList";
import PaymentForm from "./pages/payments/PaymentForm";
import ShippingList from "./pages/shipping/ShippingList";
import ShippingForm from "./pages/shipping/ShippingForm";
import UserList from "./pages/user-management/UserList";
import UserForm from "./pages/user-management/UserForm";
import RoleList from "./pages/user-management/RoleList";
import RoleForm from "./pages/user-management/RoleForm";
import PermissionList from "./pages/user-management/PermissionList";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingFallback() {
  return <div className="w-full h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppLayout>
        <Switch>
          {/* Auth routes */}
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>

          {/* Dashboard - homepage */}
          <Route path="/">
            <Dashboard />
          </Route>

          {/* Customers */}
          <Route path="/customers">
            <CustomerList />
          </Route>
          <Route path="/customers/new">
            <CustomerForm />
          </Route>
          <Route path="/customers/:id">
            <CustomerForm />
          </Route>

          {/* Brands */}
          <Route path="/brands">
            <BrandList />
          </Route>
          <Route path="/brands/new">
            <BrandForm />
          </Route>
          <Route path="/brands/:id">
            <BrandForm />
          </Route>

          {/* Categories */}
          <Route path="/categories">
            <CategoryList />
          </Route>
          <Route path="/categories/new">
            <CategoryForm />
          </Route>
          <Route path="/categories/:id">
            <CategoryForm />
          </Route>

          {/* Products */}
          <Route path="/products">
            <ProductList />
          </Route>
          <Route path="/products/new">
            <ProductForm />
          </Route>
          <Route path="/products/:id">
            <ProductForm />
          </Route>

          {/* Orders */}
          <Route path="/orders">
            <OrderList />
          </Route>
          <Route path="/orders/new">
            <OrderForm />
          </Route>
          <Route path="/orders/:id/edit">
            <OrderForm />
          </Route>
          <Route path="/orders/:id">
            <OrderDetails />
          </Route>

          {/* Payments */}
          <Route path="/payments">
            <PaymentList />
          </Route>
          <Route path="/payments/new">
            <PaymentForm />
          </Route>
          <Route path="/payments/:id">
            <PaymentForm />
          </Route>

          {/* Shipping */}
          <Route path="/shipping">
            <ShippingList />
          </Route>
          <Route path="/shipping/new">
            <ShippingForm />
          </Route>
          <Route path="/shipping/:id">
            <ShippingForm />
          </Route>

          {/* User Management */}
          <Route path="/users">
            <UserList />
          </Route>
          <Route path="/users/new">
            <UserForm />
          </Route>
          <Route path="/users/:id">
            <UserForm />
          </Route>
          <Route path="/roles">
            <RoleList />
          </Route>
          <Route path="/roles/new">
            <RoleForm />
          </Route>
          <Route path="/roles/:id">
            <RoleForm />
          </Route>
          <Route path="/permissions">
            <PermissionList />
          </Route>

          {/* Fallback for 404 */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </AppLayout>
    </Suspense>
  );
}

export default App;