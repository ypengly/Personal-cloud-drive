export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value >= 100 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function fileKind(mimeType: string): "image" | "video" | "audio" | "pdf" | "archive" | "text" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return "archive";
  if (mimeType.startsWith("text/")) return "text";
  return "other";
}

export function canPreview(mimeType: string): boolean {
  const kind = fileKind(mimeType);
  return kind === "image" || kind === "video" || kind === "audio" || kind === "pdf" || kind === "text";
}
