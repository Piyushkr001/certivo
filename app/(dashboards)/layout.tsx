import type { ReactNode } from "react";
import { DashboardSidebar } from "./_components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // column on small screens (sidebar topbar above content),
    // row on large screens (sidebar to the left).
    <div className="flex h-screen flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Sidebar (renders mobile topbar automatically) */}
      <DashboardSidebar />

      {/* Main content area */}
      <main className="flex-1 w-full overflow-auto px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        {/* center content and constrain width for very wide screens */}
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
