export interface DriveFile {
  id: string;
  ownerId: string;
  folderId: string | null;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DriveFolder {
  id: string;
  ownerId: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Breadcrumb {
  id: string;
  name: string;
}

export interface ShareLink {
  id: string;
  fileId: string;
  token: string;
  expiresAt: string | null;
  permission: "view" | "download";
  disabled: boolean;
  createdAt: string;
}
