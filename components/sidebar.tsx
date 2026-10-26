"use client";

import {
  Globe,
  FileText,
  Layout,
  ArrowUp,
  ArrowDown,
  Menu,
  FolderTree,
  PanelLeft,
  Palette,
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
    title: "Categories",
    url: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Templates",
    url: "/admin/templates",
    icon: Layout,
  },
  {
    title: "Theme",
    url: "/admin/theme",
    icon: Palette,
  },
  {
    title: "Headers",
    url: "/admin/fragments/headers",
    icon: ArrowUp,
  },
  {
    title: "Footers",
    url: "/admin/fragments/footers",
    icon: ArrowDown,
  },
  {
    title: "General content",
    url: "/admin/fragments/general",
    icon: PanelLeft,
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
                <span className="text-lg font-semibold">Carbon</span>
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
