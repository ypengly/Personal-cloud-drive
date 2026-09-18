import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().trim().min(1, "Folder name is required").max(255),
  parentId: z.string().nullable().optional().default(null),
});

export const renameFolderSchema = z.object({
  name: z.string().trim().min(1, "Folder name is required").max(255),
});

export const moveFolderSchema = z.object({
  parentId: z.string().nullable(),
});
