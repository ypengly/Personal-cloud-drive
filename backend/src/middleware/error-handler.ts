import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error";
import { MulterError } from "multer";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ error: { code: "FILE_TOO_LARGE", message: "Uploaded file exceeds the size limit" } });
    }
    return res.status(400).json({ error: { code: "UPLOAD_ERROR", message: err.message } });
  }

  // Anything unexpected: log full detail server-side, tell the client nothing internal.
  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
  });
}
