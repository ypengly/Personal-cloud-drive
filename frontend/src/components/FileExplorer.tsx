import { useState } from "react";
import {
  Copy,
  Download,
  Eye,
  Folder as FolderIconLucide,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { FileIcon } from "./FileIcon";
import { formatBytes, formatDate, canPreview } from "../lib/format";
import { filesApi } from "../api/files";
import { foldersApi } from "../api/folders";
import { apiErrorMessage } from "../api/client";
import type { DriveFile, DriveFolder } from "../api/types";

interface Props {
  folders: DriveFolder[];
  files: DriveFile[];
  onOpenFolder: (id: string) => void;
  onPreview: (file: DriveFile) => void;
  onShare: (file: DriveFile) => void;
  onDeleteFile: (file: DriveFile) => void;
  onDeleteFolder: (folder: DriveFolder) => void;
  onChanged: () => void;
}

export function FileExplorer({
  folders,
  files,
  onOpenFolder,
  onPreview,
  onShare,
  onDeleteFile,
  onDeleteFolder,
  onChanged,
}: Props) {
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ type: "file" | "folder"; id: string; value: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  async function commitRename() {
    if (!renaming) return;
    const { type, id, value } = renaming;
    const trimmed = value.trim();
    setRenaming(null);
    if (!trimmed) return;
    try {
      if (type === "file") await filesApi.rename(id, trimmed);
      else await foldersApi.rename(id, trimmed);
      onChanged();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Rename failed"));
    }
  }

  async function handleCopy(file: DriveFile) {
    try {
      await filesApi.copy(file.id, file.folderId);
      toast.success("File copied");
      onChanged();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Copy failed"));
    }
  }

  async function handleDropOnFolder(folderId: string, e: React.DragEvent) {
    e.preventDefault();
    setDragOverFolder(null);
    const fileId = e.dataTransfer.getData("text/file-id");
    if (!fileId) return;
    try {
      await filesApi.move(fileId, folderId);
      toast.success("Moved");
      onChanged();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Move failed"));
    }
  }

  return (
    <div className="rounded-lg border border-graphite-200 dark:border-graphite-800 overflow-hidden bg-white dark:bg-graphite-900">
      <div className="grid grid-cols-[1fr,100px,140px,80px] gap-3 px-4 py-2 text-xs font-medium text-graphite-500 border-b border-graphite-200 dark:border-graphite-800">
        <span>Name</span>
        <span className="text-right">Size</span>
        <span>Modified</span>
        <span />
      </div>

      {folders.map((folder) => (
        <div
          key={folder.id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverFolder(folder.id);
          }}
          onDragLeave={() => setDragOverFolder(null)}
          onDrop={(e) => handleDropOnFolder(folder.id, e)}
          className={`grid grid-cols-[1fr,100px,140px,80px] gap-3 px-4 py-2.5 items-center text-sm border-b border-graphite-100 dark:border-graphite-800 group ${
            dragOverFolder === folder.id ? "bg-brass-500/10" : "hover:bg-graphite-50 dark:hover:bg-graphite-800/60"
          }`}
        >
          <button
            onDoubleClick={() => onOpenFolder(folder.id)}
            onClick={() => onOpenFolder(folder.id)}
            className="flex items-center gap-2.5 min-w-0 text-left"
          >
            <FolderIconLucide className="w-5 h-5 text-brass-500 shrink-0" strokeWidth={1.75} />
            {renaming?.type === "folder" && renaming.id === folder.id ? (
              <input
                autoFocus
                value={renaming.value}
                onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
                onBlur={commitRename}
                onKeyDown={(e) => e.key === "Enter" && commitRename()}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-graphite-800 border border-brass-400 rounded px-1 py-0.5 text-sm"
              />
            ) : (
              <span className="truncate font-medium text-graphite-800 dark:text-graphite-100">{folder.name}</span>
            )}
          </button>
          <span className="text-right text-graphite-400">—</span>
          <span className="text-graphite-500 font-mono text-xs">{formatDate(folder.updatedAt)}</span>
          <RowMenu
            open={menuFor === folder.id}
            onToggle={() => setMenuFor(menuFor === folder.id ? null : folder.id)}
            items={[
              {
                label: "Rename",
                icon: Pencil,
                onClick: () => setRenaming({ type: "folder", id: folder.id, value: folder.name }),
              },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => onDeleteFolder(folder) },
            ]}
          />
        </div>
      ))}

      {files.map((file) => (
        <div
          key={file.id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/file-id", file.id)}
          className="grid grid-cols-[1fr,100px,140px,80px] gap-3 px-4 py-2.5 items-center text-sm border-b border-graphite-100 dark:border-graphite-800 last:border-b-0 hover:bg-graphite-50 dark:hover:bg-graphite-800/60 group"
        >
          <button
            onClick={() => (canPreview(file.mimeType) ? onPreview(file) : undefined)}
            className="flex items-center gap-2.5 min-w-0 text-left"
          >
            <FileIcon mimeType={file.mimeType} className="w-5 h-5 text-graphite-400 shrink-0" />
            {renaming?.type === "file" && renaming.id === file.id ? (
              <input
                autoFocus
                value={renaming.value}
                onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
                onBlur={commitRename}
                onKeyDown={(e) => e.key === "Enter" && commitRename()}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-graphite-800 border border-brass-400 rounded px-1 py-0.5 text-sm"
              />
            ) : (
              <span className="truncate text-graphite-800 dark:text-graphite-100">{file.originalName}</span>
            )}
          </button>
          <span className="text-right text-graphite-500 font-mono text-xs">{formatBytes(file.size)}</span>
          <span className="text-graphite-500 font-mono text-xs">{formatDate(file.updatedAt)}</span>
          <RowMenu
            open={menuFor === file.id}
            onToggle={() => setMenuFor(menuFor === file.id ? null : file.id)}
            items={[
              ...(canPreview(file.mimeType)
                ? [{ label: "Preview", icon: Eye, onClick: () => onPreview(file) }]
                : []),
              {
                label: "Download",
                icon: Download,
                onClick: () => window.open(filesApi.downloadUrl(file.id), "_blank"),
              },
              { label: "Share", icon: Share2, onClick: () => onShare(file) },
              {
                label: "Rename",
                icon: Pencil,
                onClick: () => setRenaming({ type: "file", id: file.id, value: file.originalName }),
              },
              { label: "Make a copy", icon: Copy, onClick: () => handleCopy(file) },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => onDeleteFile(file) },
            ]}
          />
        </div>
      ))}
    </div>
  );
}

function RowMenu({
  open,
  onToggle,
  items,
}: {
  open: boolean;
  onToggle: () => void;
  items: { label: string; icon: typeof Pencil; danger?: boolean; onClick: () => void }[];
}) {
  return (
    <div className="relative justify-self-end">
      <button
        onClick={onToggle}
        className="p-1.5 rounded-md text-graphite-400 opacity-0 group-hover:opacity-100 hover:bg-graphite-200 dark:hover:bg-graphite-700"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-10 w-44 rounded-md border border-graphite-200 dark:border-graphite-700 bg-white dark:bg-graphite-800 shadow-lg py-1 text-sm">
          {items.map(({ label, icon: Icon, danger, onClick }) => (
            <button
              key={label}
              onClick={() => {
                onToggle();
                onClick();
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-graphite-50 dark:hover:bg-graphite-700 ${
                danger ? "text-red-600" : "text-graphite-700 dark:text-graphite-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
