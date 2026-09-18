import { Modal } from "./Modal";
import { filesApi } from "../api/files";
import { fileKind } from "../lib/format";
import type { DriveFile } from "../api/types";

export function PreviewModal({ file, onClose }: { file: DriveFile; onClose: () => void }) {
  const url = filesApi.previewUrl(file.id);
  const kind = fileKind(file.mimeType);

  return (
    <Modal title={file.originalName} onClose={onClose} width="max-w-3xl">
      <div className="flex justify-center">
        {kind === "image" && <img src={url} alt={file.originalName} className="max-h-[70vh] rounded" />}
        {kind === "video" && <video src={url} controls className="max-h-[70vh] w-full rounded" />}
        {kind === "audio" && <audio src={url} controls className="w-full" />}
        {kind === "pdf" && <iframe src={url} title={file.originalName} className="w-full h-[70vh] rounded" />}
        {kind === "text" && <iframe src={url} title={file.originalName} className="w-full h-[70vh] rounded bg-white" />}
        {!["image", "video", "audio", "pdf", "text"].includes(kind) && (
          <div className="text-center py-10">
            <p className="text-graphite-500 mb-3">Preview unavailable</p>
            <a
              href={filesApi.downloadUrl(file.id)}
              className="text-sm font-medium text-brass-600 hover:underline"
            >
              Download file
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}
