import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { filesApi } from "../api/files";
import { apiErrorMessage } from "../api/client";

interface UploadingItem {
  id: string;
  name: string;
  progress: number;
}

export function UploadDropzone({
  folderId,
  onUploaded,
}: {
  folderId: string | null;
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState<UploadingItem[]>([]);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      for (const file of accepted) {
        const id = `${file.name}-${Date.now()}`;
        setUploading((prev) => [...prev, { id, name: file.name, progress: 0 }]);
        try {
          await filesApi.upload(file, folderId, (pct) =>
            setUploading((prev) => prev.map((u) => (u.id === id ? { ...u, progress: pct } : u)))
          );
          toast.success(`${file.name} uploaded`);
        } catch (err) {
          toast.error(apiErrorMessage(err, `Failed to upload ${file.name}`));
        } finally {
          setUploading((prev) => prev.filter((u) => u.id !== id));
          onUploaded();
        }
      }
    },
    [folderId, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-brass-500 bg-brass-500/5"
            : "border-graphite-300 dark:border-graphite-700 hover:border-graphite-400"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-6 h-6 mx-auto text-graphite-400 mb-2" strokeWidth={1.5} />
        <p className="text-sm text-graphite-600 dark:text-graphite-300">
          {isDragActive ? "Drop to upload" : "Drag files here, or click to browse"}
        </p>
      </div>

      {uploading.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploading.map((u) => (
            <div key={u.id} className="text-xs">
              <div className="flex justify-between mb-1 text-graphite-500">
                <span className="truncate">{u.name}</span>
                <span>{u.progress}%</span>
              </div>
              <div className="h-1 bg-graphite-200 dark:bg-graphite-800 rounded-full overflow-hidden">
                <div className="h-full bg-brass-500" style={{ width: `${u.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
