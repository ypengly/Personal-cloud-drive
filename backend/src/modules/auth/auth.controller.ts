import { Request, Response } from "express";
import { env } from "../../config/env";
import { authService } from "./auth.service";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/api/auth", // only sent back to auth endpoints
  });
}

export const authController = {
  async register(req: Request, res: Response) {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user, accessToken });
  },

  async login(req: Request, res: Response) {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    res.json({ user, accessToken });
  },

  async refresh(req: Request, res: Response) {
    const { accessToken, refreshToken } = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ success: true });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getProfile(req.userId!);
    res.json({ user });
  },

  async changePassword(req: Request, res: Response) {
    const result = await authService.changePassword(req.userId!, req.body);
    res.json(result);
  },
};
