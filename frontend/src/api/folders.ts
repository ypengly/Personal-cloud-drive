import { api } from "./client";
import type { Breadcrumb, DriveFile, DriveFolder } from "./types";

export const foldersApi = {
  async listContents(folderId: string | null) {
    const { data } = await api.get("/folders", { params: folderId ? { folderId } : {} });
    return data as { folders: DriveFolder[]; files: DriveFile[]; breadcrumbs: Breadcrumb[] };
  },
  async create(name: string, parentId: string | null) {
    const { data } = await api.post("/folders", { name, parentId });
    return data.folder as DriveFolder;
  },
  async rename(id: string, name: string) {
    const { data } = await api.patch(`/folders/${id}`, { name });
    return data.folder as DriveFolder;
  },
  async move(id: string, parentId: string | null) {
    const { data } = await api.patch(`/folders/${id}/move`, { parentId });
    return data.folder as DriveFolder;
  },
  async remove(id: string) {
    await api.delete(`/folders/${id}`);
  },
};
