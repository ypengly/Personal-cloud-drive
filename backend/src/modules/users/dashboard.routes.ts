import { Request, Response, Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/auth";
import { dashboardService } from "./dashboard.service";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await dashboardService.getStats(req.userId!);
    res.json(stats);
  })
);
