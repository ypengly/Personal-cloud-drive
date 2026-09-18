import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";

async function assertOwnedFolder(ownerId: string, folderId: string) {
  const folder = await prisma.folder.findFirst({ where: { id: folderId, ownerId, deletedAt: null } });
  if (!folder) throw AppError.notFound("Folder not found");
  return folder;
}

/** Walks parentId chain up to root, detecting cycles defensively. */
async function buildBreadcrumbs(ownerId: string, folderId: string | null) {
  const trail: { id: string; name: string }[] = [];
  let currentId = folderId;
  const seen = new Set<string>();

  while (currentId) {
    if (seen.has(currentId)) break; // shouldn't happen, but never loop forever
    seen.add(currentId);
    const folder = await prisma.folder.findFirst({
      where: { id: currentId, ownerId },
      select: { id: true, name: true, parentId: true },
    });
    if (!folder) break;
    trail.unshift({ id: folder.id, name: folder.name });
    currentId = folder.parentId;
  }

  return trail;
}

export const folderService = {
  async create(ownerId: string, name: string, parentId: string | null) {
    if (parentId) await assertOwnedFolder(ownerId, parentId);

    const duplicate = await prisma.folder.findFirst({
      where: { ownerId, parentId, name, deletedAt: null },
    });
    if (duplicate) {
      throw AppError.conflict("A folder with this name already exists here", "FOLDER_NAME_TAKEN");
    }

    return prisma.folder.create({ data: { ownerId, parentId, name } });
  },

  /** Lists folders + files directly inside the given folder (or root), plus breadcrumbs. */
  async listContents(ownerId: string, folderId: string | null) {
    if (folderId) await assertOwnedFolder(ownerId, folderId);

    const [folders, files, breadcrumbs] = await Promise.all([
      prisma.folder.findMany({
        where: { ownerId, parentId: folderId, deletedAt: null },
        orderBy: { name: "asc" },
      }),
      prisma.file.findMany({
        where: { ownerId, folderId, deletedAt: null },
        orderBy: { originalName: "asc" },
      }),
      buildBreadcrumbs(ownerId, folderId),
    ]);

    return { folders, files, breadcrumbs };
  },

  async rename(ownerId: string, folderId: string, name: string) {
    const folder = await assertOwnedFolder(ownerId, folderId);
    const duplicate = await prisma.folder.findFirst({
      where: { ownerId, parentId: folder.parentId, name, deletedAt: null, NOT: { id: folderId } },
    });
    if (duplicate) {
      throw AppError.conflict("A folder with this name already exists here", "FOLDER_NAME_TAKEN");
    }
    return prisma.folder.update({ where: { id: folderId }, data: { name } });
  },

  async move(ownerId: string, folderId: string, newParentId: string | null) {
    await assertOwnedFolder(ownerId, folderId);
    if (newParentId) {
      await assertOwnedFolder(ownerId, newParentId);
      if (await isDescendant(ownerId, folderId, newParentId)) {
        throw AppError.badRequest("Cannot move a folder into its own subfolder", "INVALID_MOVE");
      }
    }
    return prisma.folder.update({ where: { id: folderId }, data: { parentId: newParentId } });
  },

  /** Soft delete: folder and everything under it moves to Trash together. */
  async softDelete(ownerId: string, folderId: string) {
    await assertOwnedFolder(ownerId, folderId);
    const now = new Date();
    await softDeleteRecursive(ownerId, folderId, now);
    return { success: true };
  },
};

async function isDescendant(ownerId: string, ancestorId: string, candidateId: string): Promise<boolean> {
  let current: { id: string; parentId: string | null } | null = await prisma.folder.findFirst({
    where: { id: candidateId, ownerId },
    select: { id: true, parentId: true },
  });
  const seen = new Set<string>();
  while (current) {
    if (current.id === ancestorId) return true;
    if (seen.has(current.id)) break;
    seen.add(current.id);
    if (!current.parentId) break;
    current = await prisma.folder.findFirst({
      where: { id: current.parentId, ownerId },
      select: { id: true, parentId: true },
    });
  }
  return false;
}

async function softDeleteRecursive(ownerId: string, folderId: string, when: Date) {
  await prisma.folder.update({ where: { id: folderId }, data: { deletedAt: when } });
  await prisma.file.updateMany({ where: { ownerId, folderId, deletedAt: null }, data: { deletedAt: when } });

  const children = await prisma.folder.findMany({
    where: { ownerId, parentId: folderId, deletedAt: null },
    select: { id: true },
  });
  for (const child of children) {
    await softDeleteRecursive(ownerId, child.id, when);
  }
}
