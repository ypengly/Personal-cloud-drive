import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { shareController } from "./shares.controller";
import { createShareSchema } from "./shares.validation";

export const sharesRouter = Router();

// Authenticated management endpoints
sharesRouter.post("/", requireAuth, validateBody(createShareSchema), asyncHandler(shareController.create));
sharesRouter.get("/file/:fileId", requireAuth, asyncHandler(shareController.listForFile));
sharesRouter.delete("/:id", requireAuth, asyncHandler(shareController.disable));

// Public router (mounted separately at /share) — no auth, but rate-limited
// since these are unauthenticated and could be probed/brute-forced.
export const publicSharesRouter = Router();
const shareLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });

publicSharesRouter.get("/:token", shareLimiter, asyncHandler(shareController.publicInfo));
publicSharesRouter.get("/:token/download", shareLimiter, asyncHandler(shareController.publicDownload));
publicSharesRouter.get("/:token/preview", shareLimiter, asyncHandler(shareController.publicPreview));
