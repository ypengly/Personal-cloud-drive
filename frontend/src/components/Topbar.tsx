import { LogOut, Search, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import { authApi } from "../api/auth";

export function Topbar({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  async function handleLogout() {
    await authApi.logout().catch(() => {});
    clear();
    navigate("/login");
  }

  return (
    <header className="flex items-center gap-4 h-16 px-4 md:px-6 border-b border-graphite-200 dark:border-graphite-800 bg-white dark:bg-graphite-900">
      <div className="flex-1 max-w-xl relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search files..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-graphite-200 dark:border-graphite-700 bg-graphite-50 dark:bg-graphite-800 focus:bg-white dark:focus:bg-graphite-900 outline-none"
        />
      </div>

      <div className="relative ml-auto">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 rounded-full bg-graphite-800 dark:bg-brass-500 text-white flex items-center justify-center text-sm font-semibold"
        >
          {user?.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md border border-graphite-200 dark:border-graphite-700 bg-white dark:bg-graphite-800 shadow-lg py-1 text-sm">
            <div className="px-3 py-2 border-b border-graphite-100 dark:border-graphite-700">
              <p className="font-medium text-graphite-900 dark:text-graphite-50 truncate">{user?.name}</p>
              <p className="text-graphite-500 dark:text-graphite-400 text-xs truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-graphite-700 dark:text-graphite-200 hover:bg-graphite-50 dark:hover:bg-graphite-700"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
