import { ChevronRight, HardDrive } from "lucide-react";
import type { Breadcrumb } from "../api/types";

export function Breadcrumbs({
  trail,
  onNavigate,
}: {
  trail: Breadcrumb[];
  onNavigate: (folderId: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-graphite-500 dark:text-graphite-400 flex-wrap">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 hover:text-graphite-900 dark:hover:text-graphite-100 font-medium"
      >
        <HardDrive className="w-4 h-4" /> My Drive
      </button>
      {trail.map((crumb) => (
        <span key={crumb.id} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5" />
          <button
            onClick={() => onNavigate(crumb.id)}
            className="hover:text-graphite-900 dark:hover:text-graphite-100"
          >
            {crumb.name}
          </button>
        </span>
      ))}
    </div>
  );
}
