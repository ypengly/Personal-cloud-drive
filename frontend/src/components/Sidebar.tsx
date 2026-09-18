import { NavLink } from "react-router-dom";
import { Clock, HardDrive, Trash2 } from "lucide-react";
import { StorageBar } from "./StorageBar";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/misc";

const navItems = [
  { to: "/drive", label: "My Drive", icon: HardDrive },
  { to: "/recent", label: "Recent", icon: Clock },
  { to: "/trash", label: "Trash", icon: Trash2 },
];

export function Sidebar() {
  const { data: stats } = useQuery({ queryKey: ["dashboard"], queryFn: dashboardApi.get });

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-graphite-200 dark:border-graphite-800 bg-white dark:bg-graphite-900 p-4">
      <div className="flex items-center gap-2 px-1 mb-6">
        <div className="w-7 h-7 rounded bg-graphite-900 dark:bg-brass-500 flex items-center justify-center">
          <HardDrive className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <span className="font-sans font-semibold text-lg text-graphite-900 dark:text-graphite-50">Vault</span>
      </div>

      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-graphite-100 dark:bg-graphite-800 text-graphite-900 dark:text-graphite-50"
                  : "text-graphite-600 dark:text-graphite-400 hover:bg-graphite-50 dark:hover:bg-graphite-800/60"
              }`
            }
          >
            <Icon className="w-4 h-4" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {stats && (
        <div className="mt-6 pt-4 border-t border-graphite-200 dark:border-graphite-800">
          <StorageBar used={stats.used} total={stats.totalQuota} percent={stats.percentUsed} />
        </div>
      )}
    </aside>
  );
}
