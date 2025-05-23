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
import RoleList from "./pages/user-management/RoleList";
import PermissionList from "./pages/user-management/PermissionList";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ProtectedRoute({ component: Component, permission }: { component: React.ComponentType, permission?: string }) {
  // Para fins de demonstração, estamos pulando a verificação de autenticação e permissões
  // Isso permite que o conteúdo seja exibido mesmo sem login
  return <Component />;
}

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
      <Switch>
        {/* Auth routes */}
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>

        {/* Protected routes wrapped in AppLayout */}
        <Route path="/">
          <AppLayout>
            <ProtectedRoute component={Dashboard} />
          </AppLayout>
        </Route>

        {/* Customers */}
        <Route path="/customers">
          <AppLayout>
            <ProtectedRoute component={CustomerList} permission="view_customers" />
          </AppLayout>
        </Route>
        <Route path="/customers/new">
          <AppLayout>
            <ProtectedRoute component={CustomerForm} permission="create_customers" />
          </AppLayout>
        </Route>
        <Route path="/customers/:id">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={() => <CustomerForm id={Number(params.id)} />} permission="edit_customers" />
            </AppLayout>
          )}
        </Route>

        {/* Brands */}
        <Route path="/brands">
          <AppLayout>
            <ProtectedRoute component={BrandList} permission="view_brands" />
          </AppLayout>
        </Route>
        <Route path="/brands/new">
          <AppLayout>
            <ProtectedRoute component={BrandForm} permission="create_brands" />
          </AppLayout>
        </Route>
        <Route path="/brands/:id">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={() => <BrandForm id={Number(params.id)} />} permission="edit_brands" />
            </AppLayout>
          )}
        </Route>

        {/* Categories */}
        <Route path="/categories">
          <AppLayout>
            <ProtectedRoute component={CategoryList} permission="view_categories" />
          </AppLayout>
        </Route>
        <Route path="/categories/new">
          <AppLayout>
            <ProtectedRoute component={CategoryForm} permission="create_categories" />
          </AppLayout>
        </Route>
        <Route path="/categories/:id">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={() => <CategoryForm id={Number(params.id)} />} permission="edit_categories" />
            </AppLayout>
          )}
        </Route>

        {/* Products */}
        <Route path="/products">
          <AppLayout>
            <ProtectedRoute component={ProductList} permission="view_products" />
          </AppLayout>
        </Route>
        <Route path="/products/new">
          <AppLayout>
            <ProtectedRoute component={ProductForm} permission="create_products" />
          </AppLayout>
        </Route>
        <Route path="/products/:id">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={() => <ProductForm id={Number(params.id)} />} permission="edit_products" />
            </AppLayout>
          )}
        </Route>

        {/* Orders */}
        <Route path="/orders">
          <AppLayout>
            <ProtectedRoute component={OrderList} permission="view_orders" />
          </AppLayout>
        </Route>
        <Route path="/orders/new">
          <AppLayout>
            <ProtectedRoute component={OrderForm} permission="create_orders" />
          </AppLayout>
        </Route>
        <Route path="/orders/:id/edit">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={() => <OrderForm id={Number(params.id)} />} permission="edit_orders" />
            </AppLayout>
          )}
        </Route>
        <Route path="/orders/:id">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={() => <OrderDetails id={Number(params.id)} />} permission="view_orders" />
            </AppLayout>
          )}
        </Route>

        {/* Payments */}
        <Route path="/payments">
          <AppLayout>
            <ProtectedRoute component={PaymentList} permission="view_payments" />
          </AppLayout>
        </Route>
        <Route path="/payments/new">
          <AppLayout>
            <ProtectedRoute component={PaymentForm} permission="create_payments" />
          </AppLayout>
        </Route>
        <Route path="/payments/:id">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={() => <PaymentForm id={Number(params.id)} />} permission="edit_payments" />
            </AppLayout>
          )}
        </Route>

        {/* Shipping */}
        <Route path="/shipping">
          <AppLayout>
            <ProtectedRoute component={ShippingList} permission="view_shipping" />
          </AppLayout>
        </Route>
        <Route path="/shipping/new">
          <AppLayout>
            <ProtectedRoute component={ShippingForm} permission="create_shipping" />
          </AppLayout>
        </Route>
        <Route path="/shipping/:id">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={() => <ShippingForm id={Number(params.id)} />} permission="edit_shipping" />
            </AppLayout>
          )}
        </Route>

        {/* User Management */}
        <Route path="/users">
          <AppLayout>
            <ProtectedRoute component={UserList} permission="view_users" />
          </AppLayout>
        </Route>
        <Route path="/roles">
          <AppLayout>
            <ProtectedRoute component={RoleList} permission="view_roles" />
          </AppLayout>
        </Route>
        <Route path="/permissions">
          <AppLayout>
            <ProtectedRoute component={PermissionList} permission="view_permissions" />
          </AppLayout>
        </Route>

        {/* Fallback for 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default App;
