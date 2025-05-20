import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { loading } = useAuth();

  // Vamos pular o skeleton de carregamento para evitar problemas
  // Mesmo que esteja carregando, vamos mostrar a interface

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
