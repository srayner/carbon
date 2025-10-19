import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarManagerProvider } from "@/context/sidebar-manager";
import SideBar from "@/components/sidebar";
import NavBar from "@/components/navbar";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { PageActionsProvider } from "@/context/page-actions";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SideBar />
        <main className="w-full">
          <SidebarManagerProvider>
            <PageActionsProvider>
              <div className="flex flex-col h-screen">
                <NavBar />
                <div className="flex-1">{children}</div>
                <Toaster />
              </div>
            </PageActionsProvider>
          </SidebarManagerProvider>
        </main>
      </SidebarProvider>
    </>
  );
}
