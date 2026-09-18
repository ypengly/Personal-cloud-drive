import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { authRouter } from "./modules/auth/auth.routes";
import { foldersRouter } from "./modules/folders/folders.routes";
import { filesRouter } from "./modules/files/files.routes";
import { trashRouter } from "./modules/trash/trash.routes";
import { publicSharesRouter, sharesRouter } from "./modules/shares/shares.routes";
import { dashboardRouter } from "./modules/users/dashboard.routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" })); // file bodies go through multer, not JSON

  // Baseline rate limit across the whole API; tighter limits are applied
  // per-route (e.g. login) in later steps.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/folders", foldersRouter);
  app.use("/api/files", filesRouter);
  app.use("/api/trash", trashRouter);
  app.use("/api/shares", sharesRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/share", publicSharesRouter); // public, unauthenticated share-link access

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
