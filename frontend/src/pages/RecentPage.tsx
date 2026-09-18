import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { dashboardApi } from "../api/misc";
import { filesApi } from "../api/files";
import { FileIcon } from "../components/FileIcon";
import { EmptyState } from "../components/EmptyState";
import { StorageBar } from "../components/StorageBar";
import { formatBytes, formatDate } from "../lib/format";

export function RecentPage() {
  const { data: stats } = useQuery({ queryKey: ["dashboard"], queryFn: dashboardApi.get });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Files" value={stats.fileCount} />
          <StatCard label="Folders" value={stats.folderCount} />
          <StatCard label="Storage used" value={`${stats.percentUsed}%`} />
          <StatCard label="Available" value={formatBytes(stats.available)} />
        </div>
      )}

      {stats && (
        <div className="rounded-lg border border-graphite-200 dark:border-graphite-800 bg-white dark:bg-graphite-900 p-4">
          <StorageBar used={stats.used} total={stats.totalQuota} percent={stats.percentUsed} />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {Object.entries(stats.usageByType).map(([label, info]) => (
              <div key={label} className="flex justify-between text-graphite-600 dark:text-graphite-300">
                <span>{label}</span>
                <span className="font-mono text-xs text-graphite-400">{formatBytes(info.bytes)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-sans font-semibold text-lg text-graphite-900 dark:text-graphite-50 mb-3">
          Recent files
        </h2>
        {!stats || stats.recentFiles.length === 0 ? (
          <EmptyState icon={Clock} title="Nothing yet" message="Files you upload will show up here." />
        ) : (
          <div className="rounded-lg border border-graphite-200 dark:border-graphite-800 bg-white dark:bg-graphite-900 divide-y divide-graphite-100 dark:divide-graphite-800">
            {stats.recentFiles.map((file) => (
              <a
                key={file.id}
                href={filesApi.previewUrl(file.id)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-graphite-50 dark:hover:bg-graphite-800/60"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileIcon mimeType={file.mimeType} className="w-5 h-5 text-graphite-400 shrink-0" />
                  <span className="truncate text-graphite-800 dark:text-graphite-100">{file.originalName}</span>
                </div>
                <span className="text-xs text-graphite-400 font-mono shrink-0">{formatDate(file.createdAt)}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-graphite-200 dark:border-graphite-800 bg-white dark:bg-graphite-900 p-4">
      <p className="text-2xl font-sans font-semibold text-graphite-900 dark:text-graphite-50">{value}</p>
      <p className="text-xs text-graphite-500 mt-0.5">{label}</p>
    </div>
  );
}
