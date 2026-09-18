import { formatBytes } from "../lib/format";

export function StorageBar({ used, total, percent }: { used: number; total: number; percent: number }) {
  return (
    <div className="px-1">
      <div className="h-1.5 w-full rounded-full bg-graphite-200 dark:bg-graphite-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-brass-500 transition-all"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-graphite-500 dark:text-graphite-400 font-mono">
        {formatBytes(used)} of {formatBytes(total)} used
      </p>
    </div>
  );
}
