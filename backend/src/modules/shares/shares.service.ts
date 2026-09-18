import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";
import { storageService } from "../../storage";

function generateToken() {
  return randomBytes(9).toString("base64url"); // short, URL-safe: /share/abc123xyz-like
}

export const shareService = {
  async create(
    ownerId: string,
    fileId: string,
    opts: { password?: string; expiresInHours?: number; permission?: "view" | "download" }
  ) {
    const file = await prisma.file.findFirst({ where: { id: fileId, ownerId, deletedAt: null } });
    if (!file) throw AppError.notFound("File not found");

    const passwordHash = opts.password ? await bcrypt.hash(opts.password, 12) : null;
    const expiresAt = opts.expiresInHours ? new Date(Date.now() + opts.expiresInHours * 3600_000) : null;

    const share = await prisma.share.create({
      data: {
        fileId,
        token: generateToken(),
        passwordHash,
        expiresAt,
        permission: opts.permission ?? "view",
      },
    });
    return share;
  },

  async listForFile(ownerId: string, fileId: string) {
    const file = await prisma.file.findFirst({ where: { id: fileId, ownerId, deletedAt: null } });
    if (!file) throw AppError.notFound("File not found");
    return prisma.share.findMany({ where: { fileId }, orderBy: { createdAt: "desc" } });
  },

  async disable(ownerId: string, shareId: string) {
    const share = await prisma.share.findUnique({ where: { id: shareId }, include: { file: true } });
    if (!share || share.file.ownerId !== ownerId) throw AppError.notFound("Share link not found");
    return prisma.share.update({ where: { id: shareId }, data: { disabled: true } });
  },

  /** Resolves a public token to its file, enforcing expiry/disabled/password. */
  async resolve(token: string, password?: string) {
    const share = await prisma.share.findUnique({ where: { token }, include: { file: true } });
    if (!share || share.disabled || share.file.deletedAt) {
      throw AppError.notFound("This link is no longer available");
    }
    if (share.expiresAt && share.expiresAt.getTime() < Date.now()) {
      throw AppError.notFound("This link has expired");
    }
    if (share.passwordHash) {
      if (!password || !(await bcrypt.compare(password, share.passwordHash))) {
        throw AppError.unauthorized("A valid password is required for this link", "SHARE_PASSWORD_REQUIRED");
      }
    }
    return share;
  },

  async downloadShared(token: string, password?: string) {
    const share = await this.resolve(token, password);
    if (share.permission !== "download") {
      throw AppError.forbidden("This link is view-only", "SHARE_VIEW_ONLY");
    }
    const stream = await storageService.download(share.file.storagePath);
    return { file: share.file, stream };
  },

  async previewShared(token: string, password?: string) {
    const share = await this.resolve(token, password);
    const stream = await storageService.download(share.file.storagePath);
    return { file: share.file, stream };
  },
};
