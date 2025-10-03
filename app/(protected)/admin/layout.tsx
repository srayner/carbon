// app/editor/layout.tsx
"use client";

import { ReactNode } from "react";

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-200 border-r p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Carbon</h2>
        <nav className="space-y-2">
          <a href="#" className="block px-2 py-1 rounded hover:bg-gray-300">
            Dashboard
          </a>
          <a href="#" className="block px-2 py-1 rounded hover:bg-gray-300">
            Pages
          </a>
          <a href="#" className="block px-2 py-1 rounded hover:bg-gray-300">
            Media
          </a>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-gray-100 border-b flex items-center justify-between px-6">
          <div className="font-bold text-lg">App Toolbar</div>
          <div>User / Profile</div>
        </header>

        {/* Page content */}
        <main className="p-6 flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
