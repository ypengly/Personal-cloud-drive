import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";
import { storageService } from "../../storage";

async function deleteFolderRecursive(ownerId: string, folderId: string) {
  const files = await prisma.file.findMany({ where: { ownerId, folderId } });
  for (const file of files) {
    await storageService.delete(file.storagePath).catch(() => {});
  }
  await prisma.file.deleteMany({ where: { ownerId, folderId } });

  const children = await prisma.folder.findMany({ where: { ownerId, parentId: folderId }, select: { id: true } });
  for (const child of children) {
    await deleteFolderRecursive(ownerId, child.id);
  }

  await prisma.folder.delete({ where: { id: folderId } });
}

export const trashService = {
  async list(ownerId: string) {
    const [files, folders] = await Promise.all([
      prisma.file.findMany({ where: { ownerId, deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } }),
      prisma.folder.findMany({ where: { ownerId, deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } }),
    ]);
    return { files, folders };
  },

  async restoreFile(ownerId: string, fileId: string) {
    const file = await prisma.file.findFirst({ where: { id: fileId, ownerId, deletedAt: { not: null } } });
    if (!file) throw AppError.notFound("File not found in trash");

    // If the parent folder was also deleted (or no longer exists), restore to root
    // rather than leaving an orphaned reference to a folder still in trash.
    let targetFolderId = file.folderId;
    if (targetFolderId) {
      const parent = await prisma.folder.findFirst({ where: { id: targetFolderId, ownerId, deletedAt: null } });
      if (!parent) targetFolderId = null;
    }

    return prisma.file.update({ where: { id: fileId }, data: { deletedAt: null, folderId: targetFolderId } });
  },

  async restoreFolder(ownerId: string, folderId: string) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, ownerId, deletedAt: { not: null } } });
    if (!folder) throw AppError.notFound("Folder not found in trash");

    let targetParentId = folder.parentId;
    if (targetParentId) {
      const parent = await prisma.folder.findFirst({ where: { id: targetParentId, ownerId, deletedAt: null } });
      if (!parent) targetParentId = null;
    }

    return prisma.folder.update({ where: { id: folderId }, data: { deletedAt: null, parentId: targetParentId } });
  },

  async permanentlyDeleteFile(ownerId: string, fileId: string) {
    const file = await prisma.file.findFirst({ where: { id: fileId, ownerId, deletedAt: { not: null } } });
    if (!file) throw AppError.notFound("File not found in trash");

    await storageService.delete(file.storagePath).catch(() => {
      // Storage object already gone is fine; DB row is the source of truth for the user.
    });
    await prisma.file.delete({ where: { id: fileId } });
    return { success: true };
  },

  async permanentlyDeleteFolder(ownerId: string, folderId: string) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, ownerId, deletedAt: { not: null } } });
    if (!folder) throw AppError.notFound("Folder not found in trash");

    await deleteFolderRecursive(ownerId, folderId);
    return { success: true };
  },

  async empty(ownerId: string) {
    const files = await prisma.file.findMany({ where: { ownerId, deletedAt: { not: null } } });
    for (const file of files) {
      await storageService.delete(file.storagePath).catch(() => {});
    }
    await prisma.file.deleteMany({ where: { ownerId, deletedAt: { not: null } } });
    await prisma.folder.deleteMany({ where: { ownerId, deletedAt: { not: null } } });
    return { success: true };
  },
};
