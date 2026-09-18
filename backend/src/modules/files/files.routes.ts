import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/auth";
import { uploadMiddleware } from "../../middleware/upload";
import { validateBody, validateQuery } from "../../middleware/validate";
import { fileController } from "./files.controller";
import { copyFileSchema, listFilesQuerySchema, moveFileSchema, renameFileSchema } from "./files.validation";

export const filesRouter = Router();
filesRouter.use(requireAuth);

filesRouter.get("/", validateQuery(listFilesQuerySchema), asyncHandler(fileController.list));
filesRouter.post("/upload", uploadMiddleware.single("file"), asyncHandler(fileController.upload));
filesRouter.get("/:id", asyncHandler(fileController.getById));
filesRouter.get("/:id/download", asyncHandler(fileController.download));
filesRouter.get("/:id/preview", asyncHandler(fileController.preview));
filesRouter.patch("/:id", validateBody(renameFileSchema), asyncHandler(fileController.rename));
filesRouter.patch("/:id/move", validateBody(moveFileSchema), asyncHandler(fileController.move));
filesRouter.post("/:id/copy", validateBody(copyFileSchema), asyncHandler(fileController.copy));
filesRouter.delete("/:id", asyncHandler(fileController.remove));
