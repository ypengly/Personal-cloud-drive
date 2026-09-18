import { useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderPlus, Inbox } from "lucide-react";
import toast from "react-hot-toast";
import { foldersApi } from "../api/folders";
import { filesApi } from "../api/files";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { UploadDropzone } from "../components/UploadDropzone";
import { FileExplorer } from "../components/FileExplorer";
import { SortControl, SortField } from "../components/SortControl";
import { EmptyState } from "../components/EmptyState";
import { Modal, ConfirmDialog } from "../components/Modal";
import { PreviewModal } from "../components/PreviewModal";
import { ShareDialog } from "../components/ShareDialog";
import { apiErrorMessage } from "../api/client";
import type { DriveFile, DriveFolder } from "../api/types";

export function DrivePage() {
  const { search } = useOutletContext<{ search: string }>();
  const [params, setParams] = useSearchParams();
  const folderId = params.get("folderId");
  const [sort, setSort] = useState<SortField>("date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [shareFile, setShareFile] = useState<DriveFile | null>(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState<DriveFile | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<DriveFolder | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["folder-contents", folderId],
    queryFn: () => foldersApi.listContents(folderId),
  });

  const { data: searchResults } = useQuery({
    queryKey: ["file-search", search, sort, order],
    queryFn: () => filesApi.list({ search, sort, order }),
    enabled: search.trim().length > 0,
  });

  const isSearching = search.trim().length > 0;

  const sortedFolders = useMemo(() => {
    if (!data) return [];
    const list = [...data.folders];
    list.sort((a, b) => {
      const cmp =
        sort === "date" ? a.updatedAt.localeCompare(b.updatedAt) : a.name.localeCompare(b.name);
      return order === "asc" ? cmp : -cmp;
    });
    return list;
  }, [data, sort, order]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["file-search"] });
  }

  function openFolder(id: string) {
    setParams(id ? { folderId: id } : {});
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await foldersApi.create(name, folderId);
      setShowNewFolder(false);
      setNewFolderName("");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create folder"));
    }
  }

  async function confirmDeleteFile() {
    if (!deleteFileTarget) return;
    try {
      await filesApi.remove(deleteFileTarget.id);
      toast.success("Moved to trash");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Delete failed"));
    } finally {
      setDeleteFileTarget(null);
    }
  }

  async function confirmDeleteFolder() {
    if (!deleteFolderTarget) return;
    try {
      await foldersApi.remove(deleteFolderTarget.id);
      toast.success("Moved to trash");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Delete failed"));
    } finally {
      setDeleteFolderTarget(null);
    }
  }

  const files = isSearching ? searchResults ?? [] : data?.files ?? [];
  const folders = isSearching ? [] : sortedFolders;
  const hasContent = files.length > 0 || folders.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {isSearching ? (
          <p className="text-sm text-graphite-500">
            Search results for <span className="font-medium text-graphite-800 dark:text-graphite-100">"{search}"</span>
          </p>
        ) : (
          <Breadcrumbs trail={data?.breadcrumbs ?? []} onNavigate={openFolder} />
        )}
        <div className="flex items-center gap-2">
          <SortControl
            sort={sort}
            order={order}
            onChange={(s, o) => {
              setSort(s);
              setOrder(o);
            }}
          />
          {!isSearching && (
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-1.5 text-sm font-medium rounded-md border border-graphite-300 dark:border-graphite-700 px-3 py-1.5 hover:bg-graphite-100 dark:hover:bg-graphite-800"
            >
              <FolderPlus className="w-4 h-4" /> New folder
            </button>
          )}
        </div>
      </div>

      {!isSearching && <UploadDropzone folderId={folderId} onUploaded={invalidate} />}

      {isLoading && !isSearching ? (
        <p className="text-sm text-graphite-400 text-center py-10">Loading…</p>
      ) : hasContent ? (
        <FileExplorer
          folders={folders}
          files={files}
          onOpenFolder={openFolder}
          onPreview={setPreviewFile}
          onShare={setShareFile}
          onDeleteFile={setDeleteFileTarget}
          onDeleteFolder={setDeleteFolderTarget}
          onChanged={invalidate}
        />
      ) : (
        <EmptyState
          icon={Inbox}
          title={isSearching ? "No matching files" : "This folder is empty"}
          message={isSearching ? "Try a different search term." : "Drag files above to upload, or create a folder."}
        />
      )}

      {showNewFolder && (
        <Modal title="New folder" onClose={() => setShowNewFolder(false)}>
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            placeholder="Folder name"
            className="w-full rounded-md border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 px-3 py-2 text-sm outline-none focus:border-brass-500"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowNewFolder(false)}
              className="px-3 py-1.5 text-sm rounded-md border border-graphite-300 dark:border-graphite-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFolder}
              className="px-3 py-1.5 text-sm rounded-md bg-graphite-900 dark:bg-brass-500 text-white"
            >
              Create
            </button>
          </div>
        </Modal>
      )}

      {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      {shareFile && <ShareDialog file={shareFile} onClose={() => setShareFile(null)} />}

      {deleteFileTarget && (
        <ConfirmDialog
          title="Move to trash?"
          message={`"${deleteFileTarget.originalName}" will be moved to Trash. You can restore it later.`}
          confirmLabel="Move to trash"
          destructive
          onConfirm={confirmDeleteFile}
          onCancel={() => setDeleteFileTarget(null)}
        />
      )}
      {deleteFolderTarget && (
        <ConfirmDialog
          title="Move to trash?"
          message={`"${deleteFolderTarget.name}" and everything inside it will be moved to Trash.`}
          confirmLabel="Move to trash"
          destructive
          onConfirm={confirmDeleteFolder}
          onCancel={() => setDeleteFolderTarget(null)}
        />
      )}
    </div>
  );
}
