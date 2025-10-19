"use client";
import React from "react";
import { useSidebarManager } from "@/context/sidebar-manager";

type Props = {
  side: "left" | "right";
  children?: React.ReactNode;
};

export default function EditorSidebar({ side, children }: Props) {
  const { leftOpen, rightOpen } = useSidebarManager();
  const isOpen = side === "left" ? leftOpen : rightOpen;
  if (!isOpen) return null;

  const classes =
    side === "left"
      ? "w-64 border-r p-2 bg-blue-100" // temporary left sidebar bg
      : "w-64 border-l p-2 bg-green-100"; // temporary right sidebar bg

  return (
    <aside className={classes}>
      {children || <p>{side} sidebar placeholder</p>}
    </aside>
  );
}
