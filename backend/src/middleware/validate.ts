import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../lib/app-error";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(", ");
      throw AppError.badRequest(message, "VALIDATION_ERROR");
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(", ");
      throw AppError.badRequest(message, "VALIDATION_ERROR");
    }
    // Store parsed query separately; Express 5 makes req.query a getter-only,
    // so we don't reassign it directly.
    (req as Request & { validatedQuery?: unknown }).validatedQuery = result.data;
    next();
  };
}
