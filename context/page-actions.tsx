"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type PageActions = {
  showEditorSidebars?: boolean;
  showAddButton?: boolean;
  showSaveButton?: boolean;
  onAdd?: () => void;
  onSave?: () => void;
};

type PageActionsContextType = PageActions & {
  setPageActions: (actions: PageActions) => void;
};

const PageActionsContext = createContext<PageActionsContextType | null>(null);

export function PageActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<PageActions>({
    showEditorSidebars: false,
    showAddButton: false,
    showSaveButton: false,
    onAdd: undefined,
    onSave: undefined,
  });

  return (
    <PageActionsContext.Provider
      value={{ ...actions, setPageActions: setActions }}
    >
      {children}
    </PageActionsContext.Provider>
  );
}

export function usePageActions() {
  const ctx = useContext(PageActionsContext);
  if (!ctx)
    throw new Error("usePageActions must be used within a PageActionsProvider");
  return ctx;
}
