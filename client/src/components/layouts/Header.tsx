import React, { useState } from "react";
import { Bell, Settings, ChevronDown, User, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  // Extract current page title from location
  React.useEffect(() => {
    const location = window.location.pathname;
    if (location === '/') {
      setPageTitle('Dashboard');
    } else if (location.includes('/customers')) {
      setPageTitle('Customers');
    } else if (location.includes('/products')) {
      setPageTitle('Products');
    } else if (location.includes('/categories')) {
      setPageTitle('Categories');
    } else if (location.includes('/brands')) {
      setPageTitle('Brands');
    } else if (location.includes('/orders')) {
      setPageTitle('Orders');
    } else if (location.includes('/payments')) {
      setPageTitle('Payments');
    } else if (location.includes('/shipping')) {
      setPageTitle('Shipping');
    } else if (location.includes('/users')) {
      setPageTitle('Users');
    } else if (location.includes('/roles')) {
      setPageTitle('Roles');
    } else if (location.includes('/permissions')) {
      setPageTitle('Permissions');
    }
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow z-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section - Mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-2 md:hidden text-gray-500 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:ml-4 md:flex md:items-center">
              <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">{pageTitle}</div>
            </div>
          </div>

          {/* Right section - User menu */}
          <div className="flex items-center">
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="max-w-xs flex items-center rounded-full bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 p-2">
                    <span className="sr-only">Open user menu</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-gray-700 dark:text-gray-200 font-medium">
                      {user?.username || "User"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? (
                      <>
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="5" />
                          <line x1="12" y1="1" x2="12" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="23" />
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                          <line x1="1" y1="12" x2="3" y2="12" />
                          <line x1="21" y1="12" x2="23" y2="12" />
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                        <span>Dark Mode</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      // Implementação direta do logout
                      localStorage.removeItem('auth_token');
                      // Forçar redirecionamento para login
                      window.location.href = '/login';
                    }}
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sair do Sistema</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="ml-2 flex items-center md:ml-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="ml-3 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
