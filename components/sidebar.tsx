"use client";

import {
  Globe,
  FileText,
  Layout,
  ArrowUp,
  ArrowDown,
  Menu,
} from "lucide-react";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";

const items = [
  {
    title: "Sites",
    url: "/admin/sites",
    icon: Globe,
  },
  {
    title: "Pages",
    url: "/admin//pages",
    icon: FileText,
  },
  {
    title: "Templates",
    url: "/admin/templates",
    icon: Layout,
  },
  {
    title: "Headers",
    url: "/admin/headers",
    icon: ArrowUp,
  },
  {
    title: "Footers",
    url: "/admin/footers",
    icon: ArrowDown,
  },
  {
    title: "Menus",
    url: "/admin/menus",
    icon: Menu,
  },
];

const SideBar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem className="h-[28px]">
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <Image alt="logo" src="/boron.png" width={102} height={40} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
