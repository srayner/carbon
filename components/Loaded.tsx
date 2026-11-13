"use client";

import React, { useEffect, useState } from "react";

type LoadedProps<T> = {
  id: string;
  load: (id: string) => Promise<T>;
  failedMessage: string;
  children: (data: T) => React.ReactNode;
};

/**
 * Loads one record, then shows what is built from it. Nothing is shown until
 * it has arrived, so an editor built from it never starts empty and has
 * nothing a late load could overwrite. A newer id replaces an older load.
 */
export function Loaded<T>({ id, load, failedMessage, children }: LoadedProps<T>) {
  const [result, setResult] = useState<{ id: string; data?: T; failed?: true } | null>(null);

  useEffect(() => {
    let current = true;
    load(id)
      .then((data) => current && setResult({ id, data }))
      .catch((err) => {
        console.error(failedMessage, err);
        if (current) setResult({ id, failed: true });
      });
    return () => {
      current = false;
    };
  }, [id, load, failedMessage]);

  if (result?.id !== id) {
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  }
  if (result.failed) {
    return <p className="p-6 text-sm text-destructive">{failedMessage}</p>;
  }
  return <>{children(result.data as T)}</>;
}
