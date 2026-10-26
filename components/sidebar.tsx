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
} from "./ui/sidebar";
import Link from "next/link";
import LogoMark from "./logo-mark";

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
      <SidebarHeader className="h-16 justify-center border-b px-3 py-0">
        {/* Not a menu button: that squashes its icon to 16px when collapsed.
            The mark keeps its size and only the wordmark fades out. */}
        <Link
          href="/admin"
          aria-label="Carbon"
          className="flex items-center gap-2 overflow-hidden rounded-md text-sidebar-foreground outline-hidden ring-sidebar-ring focus-visible:ring-2"
        >
          <LogoMark className="size-6 shrink-0" />
          <span className="text-lg font-semibold tracking-tight transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
            Carbon
          </span>
        </Link>
      </SidebarHeader>
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
