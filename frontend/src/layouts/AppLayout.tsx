import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

export function AppLayout() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex h-screen bg-graphite-50 dark:bg-graphite-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onSearch={setSearch} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  );
}
