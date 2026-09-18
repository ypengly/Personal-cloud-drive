import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/auth";
import { trashController } from "./trash.controller";

export const trashRouter = Router();
trashRouter.use(requireAuth);

trashRouter.get("/", asyncHandler(trashController.list));
trashRouter.post("/files/:id/restore", asyncHandler(trashController.restoreFile));
trashRouter.post("/folders/:id/restore", asyncHandler(trashController.restoreFolder));
trashRouter.delete("/files/:id", asyncHandler(trashController.deleteFile));
trashRouter.delete("/folders/:id", asyncHandler(trashController.deleteFolder));
trashRouter.delete("/", asyncHandler(trashController.empty));
