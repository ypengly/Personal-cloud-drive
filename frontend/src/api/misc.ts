import { api } from "./client";
import type { DriveFile, DriveFolder, ShareLink } from "./types";

export const trashApi = {
  async list() {
    const { data } = await api.get("/trash");
    return data as { files: DriveFile[]; folders: DriveFolder[] };
  },
  async restoreFile(id: string) {
    await api.post(`/trash/files/${id}/restore`);
  },
  async restoreFolder(id: string) {
    await api.post(`/trash/folders/${id}/restore`);
  },
  async deleteFileForever(id: string) {
    await api.delete(`/trash/files/${id}`);
  },
  async deleteFolderForever(id: string) {
    await api.delete(`/trash/folders/${id}`);
  },
  async empty() {
    await api.delete("/trash");
  },
};

export const sharesApi = {
  async create(
    fileId: string,
    opts: { password?: string; expiresInHours?: number; permission?: "view" | "download" }
  ) {
    const { data } = await api.post("/shares", { fileId, ...opts });
    return data as { share: ShareLink; url: string };
  },
  async listForFile(fileId: string) {
    const { data } = await api.get(`/shares/file/${fileId}`);
    return data.shares as ShareLink[];
  },
  async disable(id: string) {
    await api.delete(`/shares/${id}`);
  },
};

export interface DashboardStats {
  totalQuota: number;
  used: number;
  available: number;
  percentUsed: number;
  fileCount: number;
  folderCount: number;
  usageByType: Record<string, { count: number; bytes: number }>;
  recentFiles: DriveFile[];
}

export const dashboardApi = {
  async get() {
    const { data } = await api.get("/dashboard");
    return data as DashboardStats;
  },
};
