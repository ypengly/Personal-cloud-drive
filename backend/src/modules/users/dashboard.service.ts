import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";

const TYPE_BUCKETS: { label: string; prefixes: string[] }[] = [
  { label: "Images", prefixes: ["image/"] },
  { label: "Videos", prefixes: ["video/"] },
  { label: "Audio", prefixes: ["audio/"] },
  { label: "PDFs", prefixes: ["application/pdf"] },
  { label: "Documents", prefixes: ["application/msword", "application/vnd", "text/"] },
  { label: "Archives", prefixes: ["application/zip", "application/x-zip", "application/x-rar"] },
];

function bucketFor(mimeType: string): string {
  for (const bucket of TYPE_BUCKETS) {
    if (bucket.prefixes.some((p) => mimeType.startsWith(p))) return bucket.label;
  }
  return "Other";
}

export const dashboardService = {
  async getStats(ownerId: string) {
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) throw AppError.notFound("User not found");

    const [files, folderCount] = await Promise.all([
      prisma.file.findMany({ where: { ownerId, deletedAt: null }, select: { size: true, mimeType: true } }),
      prisma.folder.count({ where: { ownerId, deletedAt: null } }),
    ]);

    const used = files.reduce((sum, f) => sum + f.size, 0);
    const byType: Record<string, { count: number; bytes: number }> = {};
    for (const file of files) {
      const label = bucketFor(file.mimeType);
      byType[label] ??= { count: 0, bytes: 0 };
      byType[label].count += 1;
      byType[label].bytes += file.size;
    }

    const recentFiles = await prisma.file.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      totalQuota: user.storageQuota,
      used,
      available: Math.max(user.storageQuota - used, 0),
      percentUsed: user.storageQuota > 0 ? Math.round((used / user.storageQuota) * 100) : 0,
      fileCount: files.length,
      folderCount,
      usageByType: byType,
      recentFiles,
    };
  },
};
