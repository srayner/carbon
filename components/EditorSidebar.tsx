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

  const classes = side === "left" ? "w-72 border-r" : "w-72 border-l";

  return (
    <aside className={classes}>
      {children || <p>{side} sidebar placeholder</p>}
    </aside>
  );
}
