"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type SidebarManagerContextType = {
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  closeAll: () => void;
};

const SidebarManagerContext = createContext<SidebarManagerContextType | null>(
  null
);

export function SidebarManagerProvider({ children }: { children: ReactNode }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const toggleLeft = () => setLeftOpen((v) => !v);
  const toggleRight = () => setRightOpen((v) => !v);
  const closeAll = () => {
    setLeftOpen(false);
    setRightOpen(false);
  };

  return (
    <SidebarManagerContext.Provider
      value={{ leftOpen, rightOpen, toggleLeft, toggleRight, closeAll }}
    >
      {children}
    </SidebarManagerContext.Provider>
  );
}

export function useSidebarManager() {
  const ctx = useContext(SidebarManagerContext);
  if (!ctx)
    throw new Error(
      "useSidebarManager must be used within SidebarManagerProvider"
    );
  return ctx;
}
