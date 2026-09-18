import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Folder as FolderIconLucide, RotateCcw, Trash2 as TrashIcon, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { trashApi } from "../api/misc";
import { FileIcon } from "../components/FileIcon";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/Modal";
import { formatBytes, formatDate } from "../lib/format";
import { apiErrorMessage } from "../api/client";

export function TrashPage() {
  const queryClient = useQueryClient();
  const [emptyConfirm, setEmptyConfirm] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["trash"], queryFn: trashApi.list });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["trash"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  async function run(action: () => Promise<void>, successMsg: string) {
    try {
      await action();
      toast.success(successMsg);
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const hasContent = (data?.files.length ?? 0) > 0 || (data?.folders.length ?? 0) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-sans font-semibold text-lg text-graphite-900 dark:text-graphite-50">Trash</h1>
        {hasContent && (
          <button
            onClick={() => setEmptyConfirm(true)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Empty trash
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-graphite-400 text-center py-10">Loading…</p>
      ) : !hasContent ? (
        <EmptyState icon={TrashIcon} title="Trash is empty" message="Deleted files and folders show up here." />
      ) : (
        <div className="rounded-lg border border-graphite-200 dark:border-graphite-800 bg-white dark:bg-graphite-900 divide-y divide-graphite-100 dark:divide-graphite-800">
          {data?.folders.map((folder) => (
            <div key={folder.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderIconLucide className="w-5 h-5 text-brass-500 shrink-0" strokeWidth={1.75} />
                <span className="truncate text-graphite-800 dark:text-graphite-100">{folder.name}</span>
                <span className="text-xs text-graphite-400 font-mono shrink-0">
                  deleted {folder.deletedAt ? formatDate(folder.deletedAt) : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => run(() => trashApi.restoreFolder(folder.id), "Folder restored")}
                  className="flex items-center gap-1 text-graphite-500 hover:text-graphite-800 dark:hover:text-graphite-100"
                >
                  <RotateCcw className="w-4 h-4" /> Restore
                </button>
                <button
                  onClick={() => run(() => trashApi.deleteFolderForever(folder.id), "Deleted forever")}
                  className="flex items-center gap-1 text-graphite-400 hover:text-red-600"
                >
                  <XCircle className="w-4 h-4" /> Delete forever
                </button>
              </div>
            </div>
          ))}

          {data?.files.map((file) => (
            <div key={file.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileIcon mimeType={file.mimeType} className="w-5 h-5 text-graphite-400 shrink-0" />
                <span className="truncate text-graphite-800 dark:text-graphite-100">{file.originalName}</span>
                <span className="text-xs text-graphite-400 font-mono shrink-0">{formatBytes(file.size)}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => run(() => trashApi.restoreFile(file.id), "File restored")}
                  className="flex items-center gap-1 text-graphite-500 hover:text-graphite-800 dark:hover:text-graphite-100"
                >
                  <RotateCcw className="w-4 h-4" /> Restore
                </button>
                <button
                  onClick={() => run(() => trashApi.deleteFileForever(file.id), "Deleted forever")}
                  className="flex items-center gap-1 text-graphite-400 hover:text-red-600"
                >
                  <XCircle className="w-4 h-4" /> Delete forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {emptyConfirm && (
        <ConfirmDialog
          title="Empty trash?"
          message="Everything in Trash will be permanently deleted. This cannot be undone."
          confirmLabel="Empty trash"
          destructive
          onConfirm={() => {
            setEmptyConfirm(false);
            run(() => trashApi.empty(), "Trash emptied");
          }}
          onCancel={() => setEmptyConfirm(false)}
        />
      )}
    </div>
  );
}
