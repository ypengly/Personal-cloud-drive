import { Request, Response } from "express";
import { folderService } from "./folders.service";

export const folderController = {
  async list(req: Request, res: Response) {
    const folderId = (req.query.folderId as string) || null;
    const result = await folderService.listContents(req.userId!, folderId);
    res.json(result);
  },

  async create(req: Request, res: Response) {
    const folder = await folderService.create(req.userId!, req.body.name, req.body.parentId);
    res.status(201).json({ folder });
  },

  async rename(req: Request, res: Response) {
    const folder = await folderService.rename(req.userId!, req.params.id, req.body.name);
    res.json({ folder });
  },

  async move(req: Request, res: Response) {
    const folder = await folderService.move(req.userId!, req.params.id, req.body.parentId);
    res.json({ folder });
  },

  async remove(req: Request, res: Response) {
    const result = await folderService.softDelete(req.userId!, req.params.id);
    res.json(result);
  },
};
