"use client";

import React from "react";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="w-full">
        <div className="px-8">{children}</div>
      </main>
    </>
  );
}
