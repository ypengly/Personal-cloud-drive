import { Request, Response } from "express";
import { AppError } from "../../lib/app-error";
import { fileService, SortField } from "./files.service";
import { assertSafeUpload } from "./files.validation";

export const fileController = {
  async upload(req: Request, res: Response) {
    if (!req.file) {
      throw AppError.badRequest("No file was uploaded", "NO_FILE");
    }

    assertSafeUpload(req.file.originalname);

    const folderId = (req.body.folderId as string) || null;
    const file = await fileService.upload(
      req.userId!,
      folderId,
      req.file.path,
      req.file.originalname,
      req.file.mimetype,
      req.file.size
    );
    res.status(201).json({ file });
  },

  async list(req: Request, res: Response) {
    const { folderId, search, type, sort, order } = req.query as Record<string, string | undefined>;
    const files = await fileService.list(req.userId!, {
      folderId: folderId !== undefined ? folderId || null : undefined,
      search,
      type,
      sort: sort as SortField | undefined,
      order: order as "asc" | "desc" | undefined,
    });
    res.json({ files });
  },

  async getById(req: Request, res: Response) {
    const file = await fileService.getDetails(req.userId!, req.params.id);
    res.json({ file });
  },

  async download(req: Request, res: Response) {
    const { file, stream } = await fileService.download(req.userId!, req.params.id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader("Content-Length", String(file.size));
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  },

  /** Same as download but without forcing an attachment — used for inline preview. */
  async preview(req: Request, res: Response) {
    const { file, stream } = await fileService.download(req.userId!, req.params.id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.originalName)}"`);
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  },

  async rename(req: Request, res: Response) {
    const file = await fileService.rename(req.userId!, req.params.id, req.body.name);
    res.json({ file });
  },

  async move(req: Request, res: Response) {
    const file = await fileService.move(req.userId!, req.params.id, req.body.folderId);
    res.json({ file });
  },

  async copy(req: Request, res: Response) {
    const file = await fileService.copy(req.userId!, req.params.id, req.body.folderId);
    res.status(201).json({ file });
  },

  async remove(req: Request, res: Response) {
    const result = await fileService.softDelete(req.userId!, req.params.id);
    res.json(result);
  },
};
