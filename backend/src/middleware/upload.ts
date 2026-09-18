import multer from "multer";
import os from "os";
import { env } from "../config/env";

// Multer buffers each upload to a temp dir; the files service then streams
// it into the storage backend (local disk or S3) and removes the temp file.
// This keeps large uploads off the Node process's memory.
export const uploadMiddleware = multer({
  dest: os.tmpdir(),
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
    files: 1,
  },
});
