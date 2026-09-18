import { Request, Response } from "express";
import { shareService } from "./shares.service";

export const shareController = {
  async create(req: Request, res: Response) {
    const { fileId, password, expiresInHours, permission } = req.body;
    const share = await shareService.create(req.userId!, fileId, { password, expiresInHours, permission });
    res.status(201).json({ share: { ...share, passwordHash: undefined }, url: `/share/${share.token}` });
  },

  async listForFile(req: Request, res: Response) {
    const shares = await shareService.listForFile(req.userId!, req.params.fileId);
    res.json({ shares: shares.map((s) => ({ ...s, passwordHash: undefined })) });
  },

  async disable(req: Request, res: Response) {
    const share = await shareService.disable(req.userId!, req.params.id);
    res.json({ share: { ...share, passwordHash: undefined } });
  },

  // --- Public (unauthenticated) endpoints ---

  async publicInfo(req: Request, res: Response) {
    const share = await shareService.resolve(req.params.token, req.query.password as string | undefined);
    res.json({
      file: {
        id: share.file.id,
        originalName: share.file.originalName,
        mimeType: share.file.mimeType,
        size: share.file.size,
      },
      permission: share.permission,
    });
  },

  async publicDownload(req: Request, res: Response) {
    const { file, stream } = await shareService.downloadShared(
      req.params.token,
      req.query.password as string | undefined
    );
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  },

  async publicPreview(req: Request, res: Response) {
    const { file, stream } = await shareService.previewShared(
      req.params.token,
      req.query.password as string | undefined
    );
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.originalName)}"`);
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  },
};
