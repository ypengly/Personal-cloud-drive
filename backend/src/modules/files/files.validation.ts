import { z } from "zod";
import { AppError } from "../../lib/app-error";

export const listFilesQuerySchema = z.object({
  folderId: z.string().optional(),
  search: z.string().trim().max(255).optional(),
  type: z.string().optional(), // e.g. "image", "video", "audio", "application/pdf"
  sort: z.enum(["name", "size", "type", "date"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const renameFileSchema = z.object({
  name: z.string().trim().min(1, "File name is required").max(255),
});

export const moveFileSchema = z.object({
  folderId: z.string().nullable(),
});

export const copyFileSchema = z.object({
  folderId: z.string().nullable(),
});

// Extensions we refuse to store — executables and scripts have no place in
// a personal file drive and are a common malware-delivery vector.
const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".dll", ".bat", ".cmd", ".sh", ".ps1", ".msi", ".com", ".scr", ".vbs", ".jar", ".app",
]);

export function assertSafeUpload(originalName: string) {
  const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    throw AppError.badRequest(`File type ${ext} is not allowed`, "UNSUPPORTED_FILE_TYPE");
  }
}
