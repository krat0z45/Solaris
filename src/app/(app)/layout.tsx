import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import React, { Suspense } from "react";
import UserNav from "@/components/auth/user-nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header>
            <Suspense fallback={<div>Loading...</div>}>
              <UserNav />
            </Suspense>
          </Header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
