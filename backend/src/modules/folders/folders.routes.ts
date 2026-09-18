import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { folderController } from "./folders.controller";
import { createFolderSchema, moveFolderSchema, renameFolderSchema } from "./folders.validation";

export const foldersRouter = Router();
foldersRouter.use(requireAuth);

foldersRouter.get("/", asyncHandler(folderController.list));
foldersRouter.post("/", validateBody(createFolderSchema), asyncHandler(folderController.create));
foldersRouter.patch("/:id", validateBody(renameFolderSchema), asyncHandler(folderController.rename));
foldersRouter.patch("/:id/move", validateBody(moveFolderSchema), asyncHandler(folderController.move));
foldersRouter.delete("/:id", asyncHandler(folderController.remove));
