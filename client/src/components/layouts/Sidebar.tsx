import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Ungroup, 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Box, 
  Tags, 
  Copyright, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Shield, 
  BarChart4 
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();
  const { hasPermission } = useAuth();
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    customers: false,
    products: false,
    categories: false,
    brands: false,
    orders: false,
    payments: false,
    shipping: false,
    userManagement: false,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <BarChart4 className="w-6 h-6 mr-3 text-primary" />,
      path: "/",
      permission: null,
    },
    {
      title: "Customers",
      icon: <Users className="w-6 h-6 mr-3 text-gray-400" />,
      key: "customers",
      permission: "view_customers",
      subItems: [
        { title: "List Customers", path: "/customers", icon: <Users className="w-5 h-5 mr-3 text-gray-400" /> },
        { title: "Add Customer", path: "/customers/new", icon: <Users className="w-5 h-5 mr-3 text-gray-400" /> },
      ],
    },
    {
      title: "Products",
      icon: <Box className="w-6 h-6 mr-3 text-gray-400" />,
      key: "products",
      permission: "view_products",
      subItems: [
        { title: "List Products", path: "/products", icon: <Box className="w-5 h-5 mr-3 text-gray-400" /> },
        { title: "Add Product", path: "/products/new", icon: <Box className="w-5 h-5 mr-3 text-gray-400" /> },
      ],
    },
    {
      title: "Categories",
      icon: <Tags className="w-6 h-6 mr-3 text-gray-400" />,
      key: "categories",
      permission: "view_categories",
      subItems: [
        { title: "List Categories", path: "/categories", icon: <Tags className="w-5 h-5 mr-3 text-gray-400" /> },
        { title: "Add Category", path: "/categories/new", icon: <Tags className="w-5 h-5 mr-3 text-gray-400" /> },
      ],
    },
    {
      title: "Brands",
      icon: <Copyright className="w-6 h-6 mr-3 text-gray-400" />,
      key: "brands",
      permission: "view_brands",
      subItems: [
        { title: "List Brands", path: "/brands", icon: <Copyright className="w-5 h-5 mr-3 text-gray-400" /> },
        { title: "Add Brand", path: "/brands/new", icon: <Copyright className="w-5 h-5 mr-3 text-gray-400" /> },
      ],
    },
    {
      title: "Orders",
      icon: <ShoppingCart className="w-6 h-6 mr-3 text-gray-400" />,
      key: "orders",
      permission: "view_orders",
      subItems: [
        { title: "List Orders", path: "/orders", icon: <ShoppingCart className="w-5 h-5 mr-3 text-gray-400" /> },
        { title: "Create Order", path: "/orders/new", icon: <ShoppingCart className="w-5 h-5 mr-3 text-gray-400" /> },
      ],
    },
    {
      title: "Payments",
      icon: <CreditCard className="w-6 h-6 mr-3 text-gray-400" />,
      key: "payments",
      permission: "view_payments",
      subItems: [
        { title: "List Payments", path: "/payments", icon: <CreditCard className="w-5 h-5 mr-3 text-gray-400" /> },
        { title: "Record Payment", path: "/payments/new", icon: <CreditCard className="w-5 h-5 mr-3 text-gray-400" /> },
      ],
    },
    {
      title: "Shipping",
      icon: <Truck className="w-6 h-6 mr-3 text-gray-400" />,
      key: "shipping",
      permission: "view_shipping",
      subItems: [
        { title: "List Shipments", path: "/shipping", icon: <Truck className="w-5 h-5 mr-3 text-gray-400" /> },
        { title: "Create Shipment", path: "/shipping/new", icon: <Truck className="w-5 h-5 mr-3 text-gray-400" /> },
      ],
    },
    {
      title: "User Management",
      icon: <Shield className="w-6 h-6 mr-3 text-gray-400" />,
      key: "userManagement",
      permission: "view_users",
      subItems: [
        { title: "Users", path: "/users", icon: <Users className="w-5 h-5 mr-3 text-gray-400" /> },
        { title: "Roles", path: "/roles", icon: <Shield className="w-5 h-5 mr-3 text-gray-400" /> },
        { title: "Permissions", path: "/permissions", icon: <Shield className="w-5 h-5 mr-3 text-gray-400" /> },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "transition-transform duration-300 z-30 fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col md:relative",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center">
          <Ungroup className="text-sidebar-primary text-xl mr-2" />
          <span className="text-xl font-semibold">ERP System</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden text-gray-400 hover:text-white focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            // Skip items that require permissions the user doesn't have
            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }

            // For single items without submenus
            if (!item.subItems) {
              return (
                <Link
                  key={index}
                  href={item.path}
                  className={cn(
                    "flex items-center px-2 py-2 text-base font-medium rounded-md group",
                    isActive(item.path)
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              );
            }

            // For items with submenus
            const hasVisibleSubItems = item.subItems?.some(
              subItem => !subItem.permission || hasPermission(subItem.permission)
            );

            if (!hasVisibleSubItems) {
              return null;
            }

            return (
              <div key={index} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.key)}
                  className={cn(
                    "flex items-center justify-between w-full px-2 py-2 text-base font-medium rounded-md",
                    item.subItems?.some(subItem => isActive(subItem.path))
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                  )}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {item.title}
                  </div>
                  {openMenus[item.key] ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                {openMenus[item.key] && (
                  <div className="pl-4 space-y-1">
                    {item.subItems?.map((subItem, subIndex) => {
                      if (subItem.permission && !hasPermission(subItem.permission)) {
                        return null;
                      }
                      
                      return (
                        <Link
                          key={subIndex}
                          href={subItem.path}
                          className={cn(
                            "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                            isActive(subItem.path)
                              ? "bg-sidebar-accent text-white"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                          )}
                        >
                          {subItem.icon}
                          {subItem.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
