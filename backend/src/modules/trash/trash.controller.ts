import { Request, Response } from "express";
import { trashService } from "./trash.service";

export const trashController = {
  async list(req: Request, res: Response) {
    res.json(await trashService.list(req.userId!));
  },
  async restoreFile(req: Request, res: Response) {
    const file = await trashService.restoreFile(req.userId!, req.params.id);
    res.json({ file });
  },
  async restoreFolder(req: Request, res: Response) {
    const folder = await trashService.restoreFolder(req.userId!, req.params.id);
    res.json({ folder });
  },
  async deleteFile(req: Request, res: Response) {
    res.json(await trashService.permanentlyDeleteFile(req.userId!, req.params.id));
  },
  async deleteFolder(req: Request, res: Response) {
    res.json(await trashService.permanentlyDeleteFolder(req.userId!, req.params.id));
  },
  async empty(req: Request, res: Response) {
    res.json(await trashService.empty(req.userId!));
  },
};
