"use client";

import { useEffect, useRef } from "react";
import { LEAVE_MESSAGE, clickLeavesPage } from "@/lib/leave-guard";

/**
 * Warn before leaving a form with unsaved changes.
 *
 * Closing or reloading the tab gets the browser's own prompt. The App Router
 * has no event for leaving a route, so clicks on links in the app are caught
 * here first (capture phase) and cancelled unless the user confirms; Next's
 * Link does not navigate when the click was cancelled.
 *
 * The browser's back and forward buttons are not covered.
 */
export function useUnsavedChanges(dirty: boolean) {
  // Read through a ref, so the listeners are added once
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = ""; // older browsers need this to show the prompt
    };

    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || e.defaultPrevented) return;
      const target = e.target instanceof Element ? e.target : null;
      const link = target?.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;

      const leaves = clickLeavesPage(
        {
          button: e.button,
          modified: e.metaKey || e.ctrlKey || e.shiftKey || e.altKey,
          href: link.href,
          target: link.target,
          download: link.hasAttribute("download"),
        },
        window.location.href
      );
      if (leaves && !window.confirm(LEAVE_MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
}
