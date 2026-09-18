import { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wrap async route handlers so thrown errors / rejected promises reach
 * the global error handler instead of crashing the process or hanging
 * the request. Express 4 does not do this automatically.
 */
export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
