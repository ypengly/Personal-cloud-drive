import { env } from "../config/env";
import { StorageService } from "./storage.interface";
import { LocalStorageService } from "./local-storage.service";
import { S3StorageService } from "./s3-storage.service";

/**
 * Single entry point the rest of the app imports. Swapping storage backends
 * is a one-line env change (STORAGE_DRIVER=local|s3) — no other code changes.
 */
function createStorageService(): StorageService {
  if (env.storageDriver === "s3") {
    return new S3StorageService();
  }
  return new LocalStorageService();
}

export const storageService: StorageService = createStorageService();
export type { StorageService } from "./storage.interface";
