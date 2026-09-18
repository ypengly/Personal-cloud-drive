import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { env } from "../config/env";
import { StorageService, UploadInput } from "./storage.interface";

/**
 * Stores files on the local disk, rooted at env.localStorageDir.
 * All keys are resolved relative to that root and validated to prevent
 * path traversal (e.g. "../../etc/passwd") before ever touching fs.
 */
export class LocalStorageService implements StorageService {
  private root: string;

  constructor(root: string = env.localStorageDir) {
    this.root = path.resolve(root);
  }

  /** Resolves a storage key to an absolute path, guaranteed to stay inside root. */
  private resolveSafe(key: string): string {
    const resolved = path.resolve(this.root, key);
    if (!resolved.startsWith(this.root + path.sep) && resolved !== this.root) {
      throw new Error(`Path traversal attempt detected for key: ${key}`);
    }
    return resolved;
  }

  async upload({ key, body }: UploadInput): Promise<string> {
    const dest = this.resolveSafe(key);
    await fsp.mkdir(path.dirname(dest), { recursive: true });

    if (Buffer.isBuffer(body)) {
      await fsp.writeFile(dest, body);
    } else {
      await new Promise<void>((resolve, reject) => {
        const writeStream = fs.createWriteStream(dest);
        body.pipe(writeStream);
        body.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("finish", () => resolve());
      });
    }
    return key;
  }

  async download(storagePath: string): Promise<Readable> {
    const filePath = this.resolveSafe(storagePath);
    await fsp.access(filePath, fs.constants.R_OK); // throws if missing
    return fs.createReadStream(filePath);
  }

  async delete(storagePath: string): Promise<void> {
    const filePath = this.resolveSafe(storagePath);
    await fsp.rm(filePath, { force: true });
  }

  async exists(storagePath: string): Promise<boolean> {
    try {
      await fsp.access(this.resolveSafe(storagePath), fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(): Promise<string | null> {
    // Local dev has no public URL — files are streamed through our API.
    return null;
  }
}
