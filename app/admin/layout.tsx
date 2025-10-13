import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import SideBar from "@/components/sidebar";
import NavBar from "@/components/navbar";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";

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
          <NavBar />
          <div className="px-8">{children}</div>
          <Toaster />
        </main>
      </SidebarProvider>
    </>
  );
}
