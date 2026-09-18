import { Archive, File, FileText, Folder, Image, Music, Video } from "lucide-react";
import { fileKind } from "../lib/format";

export function FileIcon({ mimeType, className = "w-5 h-5" }: { mimeType: string; className?: string }) {
  const kind = fileKind(mimeType);
  const map = {
    image: Image,
    video: Video,
    audio: Music,
    pdf: FileText,
    archive: Archive,
    text: FileText,
    other: File,
  } as const;
  const Icon = map[kind];
  return <Icon className={className} strokeWidth={1.75} />;
}

export function FolderIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Folder className={className} strokeWidth={1.75} />;
}
