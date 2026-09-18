import { api } from "./client";
import type { DriveFile } from "./types";

export interface ListFilesParams {
  folderId?: string | null;
  search?: string;
  type?: string;
  sort?: "name" | "size" | "type" | "date";
  order?: "asc" | "desc";
}

export const filesApi = {
  async list(params: ListFilesParams) {
    const { data } = await api.get("/files", {
      params: { ...params, folderId: params.folderId ?? undefined },
    });
    return data.files as DriveFile[];
  },

  async upload(file: File, folderId: string | null, onProgress?: (pct: number) => void) {
    const form = new FormData();
    form.append("file", file);
    if (folderId) form.append("folderId", folderId);

    const { data } = await api.post("/files/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
      },
    });
    return data.file as DriveFile;
  },

  downloadUrl(id: string) {
    return `/api/files/${id}/download`;
  },

  previewUrl(id: string) {
    return `/api/files/${id}/preview`;
  },

  async rename(id: string, name: string) {
    const { data } = await api.patch(`/files/${id}`, { name });
    return data.file as DriveFile;
  },

  async move(id: string, folderId: string | null) {
    const { data } = await api.patch(`/files/${id}/move`, { folderId });
    return data.file as DriveFile;
  },

  async copy(id: string, folderId: string | null) {
    const { data } = await api.post(`/files/${id}/copy`, { folderId });
    return data.file as DriveFile;
  },

  async remove(id: string) {
    await api.delete(`/files/${id}`);
  },
};
