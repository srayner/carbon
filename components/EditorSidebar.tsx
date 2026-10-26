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

  const classes = side === "left" ? "w-72 shrink-0 overflow-y-auto border-r bg-card" : "w-72 shrink-0 overflow-y-auto border-l bg-card";

  return (
    <aside className={classes}>
      {children || <p>{side} sidebar placeholder</p>}
    </aside>
  );
}
