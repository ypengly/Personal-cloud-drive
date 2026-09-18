import { z } from "zod";

export const createShareSchema = z.object({
  fileId: z.string().min(1),
  password: z.string().min(4).max(128).optional(),
  expiresInHours: z.number().positive().max(24 * 365).optional(),
  permission: z.enum(["view", "download"]).optional(),
});

export const resolveShareQuerySchema = z.object({
  password: z.string().optional(),
});
