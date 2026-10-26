"use client";

import {
  LogOut,
  Moon,
  ListTree,
  PanelRight,
  SlidersHorizontal,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { useSidebarManager } from "@/context/sidebar-manager";
import { usePageActions } from "@/context/page-actions";
import { handleSignOut } from "@/actions/logout";

const NavBar = () => {
  const { setTheme } = useTheme();
  const { showEditorSidebars, showSaveButton, onSave } = usePageActions();
  const { leftOpen, rightOpen, toggleLeft, toggleRight } = useSidebarManager();
  const { open: navOpen, setOpen: setNavOpen } = useSidebar();

  // While editing, the editor panels need the room: fold the main navigation
  // down to its icon rail, and put it back when leaving the editor
  // setOpen changes identity whenever the sidebar toggles, so it is read
  // through a ref: the effect must only run on entering and leaving the editor
  const navRef = useRef({ navOpen, setNavOpen });
  navRef.current = { navOpen, setNavOpen };
  useEffect(() => {
    if (!showEditorSidebars) return;
    const wasOpen = navRef.current.navOpen;
    navRef.current.setNavOpen(false);
    return () => navRef.current.setNavOpen(wasOpen);
  }, [showEditorSidebars]);

  return (
    <nav className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
      {/* LEFT */}
      <div className="flex items-center gap-1">
        <SidebarTrigger aria-label="Toggle navigation" title="Toggle navigation" />
        {showEditorSidebars && (
          <>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Button
              onClick={toggleLeft}
              variant={leftOpen ? "secondary" : "ghost"}
              size="icon"
              aria-label="Toggle block outline"
              aria-pressed={leftOpen}
              title="Block outline"
            >
              <ListTree />
            </Button>
          </>
        )}
      </div>
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {showSaveButton && <Button onClick={onSave}>Save</Button>}
        {showEditorSidebars && (
          <Button
            onClick={toggleRight}
            variant={rightOpen ? "secondary" : "ghost"}
            size="icon"
            aria-label="Toggle properties"
            aria-pressed={rightOpen}
            title="Properties"
          >
            <PanelRight />
          </Button>
        )}
        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* USER MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar>
                <AvatarImage src="https://www.gravatar.com/avatar/c0d2478e84deed28fa290f797e05720d?s=32&d=identicon" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/user/profile">
              <DropdownMenuItem>
                <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/user/preferences">
              <DropdownMenuItem>
                <SlidersHorizontal className="h-[1.2rem] w-[1.2rem] mr-2" />
                Preferences
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default NavBar;
