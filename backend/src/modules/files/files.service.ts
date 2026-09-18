import fs from "fs";
import { v4 as uuid } from "uuid";
import path from "path";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";
import { storageService } from "../../storage";

const ALLOWED_SORT_FIELDS = ["name", "size", "type", "date"] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

function sortFieldToPrisma(field: SortField) {
  switch (field) {
    case "name":
      return "originalName" as const;
    case "size":
      return "size" as const;
    case "type":
      return "mimeType" as const;
    case "date":
    default:
      return "createdAt" as const;
  }
}

async function assertOwnedFile(ownerId: string, fileId: string) {
  const file = await prisma.file.findFirst({ where: { id: fileId, ownerId, deletedAt: null } });
  if (!file) throw AppError.notFound("File not found");
  return file;
}

async function assertOwnedFolderOrNull(ownerId: string, folderId: string | null) {
  if (!folderId) return;
  const folder = await prisma.folder.findFirst({ where: { id: folderId, ownerId, deletedAt: null } });
  if (!folder) throw AppError.notFound("Destination folder not found");
}

async function assertWithinQuota(ownerId: string, incomingBytes: number) {
  const user = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!user) throw AppError.notFound("User not found");

  const usage = await prisma.file.aggregate({
    where: { ownerId, deletedAt: null },
    _sum: { size: true },
  });
  const used = usage._sum.size ?? 0;

  if (used + incomingBytes > user.storageQuota) {
    throw AppError.badRequest("Storage quota exceeded", "QUOTA_EXCEEDED");
  }
}

export const fileService = {
  async upload(
    ownerId: string,
    folderId: string | null,
    tempFilePath: string,
    originalName: string,
    mimeType: string,
    size: number
  ) {
    await assertOwnedFolderOrNull(ownerId, folderId);
    await assertWithinQuota(ownerId, size);

    const storedName = `${uuid()}${path.extname(originalName)}`;
    const key = `${ownerId}/${storedName}`;

    try {
      const readStream = fs.createReadStream(tempFilePath);
      await storageService.upload({ key, body: readStream, mimeType });
    } finally {
      fs.promises.rm(tempFilePath, { force: true }).catch(() => {});
    }

    return prisma.file.create({
      data: { ownerId, folderId, originalName, storedName, mimeType, size, storagePath: key },
    });
  },

  async list(
    ownerId: string,
    opts: { folderId?: string | null; search?: string; type?: string; sort?: SortField; order?: "asc" | "desc" }
  ) {
    const { folderId, search, type, sort = "date", order = "desc" } = opts;

    const where: Record<string, unknown> = { ownerId, deletedAt: null };
    if (folderId !== undefined) where.folderId = folderId;
    if (search) where.originalName = { contains: search };
    if (type) where.mimeType = { startsWith: type };

    return prisma.file.findMany({
      where,
      orderBy: { [sortFieldToPrisma(sort)]: order },
    });
  },

  async getDetails(ownerId: string, fileId: string) {
    return assertOwnedFile(ownerId, fileId);
  },

  async download(ownerId: string, fileId: string) {
    const file = await assertOwnedFile(ownerId, fileId);
    const stream = await storageService.download(file.storagePath);
    return { file, stream };
  },

  async rename(ownerId: string, fileId: string, newName: string) {
    await assertOwnedFile(ownerId, fileId);
    return prisma.file.update({ where: { id: fileId }, data: { originalName: newName } });
  },

  async move(ownerId: string, fileId: string, folderId: string | null) {
    await assertOwnedFile(ownerId, fileId);
    await assertOwnedFolderOrNull(ownerId, folderId);
    return prisma.file.update({ where: { id: fileId }, data: { folderId } });
  },

  async copy(ownerId: string, fileId: string, folderId: string | null) {
    const original = await assertOwnedFile(ownerId, fileId);
    await assertOwnedFolderOrNull(ownerId, folderId);
    await assertWithinQuota(ownerId, original.size);

    const storedName = `${uuid()}${path.extname(original.originalName)}`;
    const newKey = `${ownerId}/${storedName}`;

    const sourceStream = await storageService.download(original.storagePath);
    await storageService.upload({ key: newKey, body: sourceStream, mimeType: original.mimeType });

    return prisma.file.create({
      data: {
        ownerId,
        folderId,
        originalName: `${original.originalName} (copy)`,
        storedName,
        mimeType: original.mimeType,
        size: original.size,
        storagePath: newKey,
      },
    });
  },

  /** Soft delete -> moves to Trash. */
  async softDelete(ownerId: string, fileId: string) {
    await assertOwnedFile(ownerId, fileId);
    await prisma.file.update({ where: { id: fileId }, data: { deletedAt: new Date() } });
    return { success: true };
  },
};

export type { SortField };
