import { Readable } from "stream";

export interface UploadInput {
  /** Unique key/path to store the file under, e.g. "<userId>/<uuid>-<filename>" */
  key: string;
  /** File contents as a stream (memory-efficient for large files) or buffer */
  body: Readable | Buffer;
  mimeType: string;
}

export interface StorageService {
  /** Persist a file, returning the storage path/key that was actually used. */
  upload(input: UploadInput): Promise<string>;

  /** Retrieve a file's contents as a readable stream. */
  download(storagePath: string): Promise<Readable>;

  /** Permanently remove a file from the backing store. */
  delete(storagePath: string): Promise<void>;

  /** Check whether a file exists in the backing store. */
  exists(storagePath: string): Promise<boolean>;

  /**
   * Get a URL usable to fetch the file directly.
   * Local driver: returns null (files are streamed through our own /download endpoint).
   * S3 driver: returns a time-limited pre-signed URL.
   */
  getUrl(storagePath: string): Promise<string | null>;
}
