import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { authController } from "./auth.controller";
import { changePasswordSchema, loginSchema, registerSchema } from "./auth.validation";

export const authRouter = Router();

// Stricter limit on login to blunt credential-stuffing / brute force attempts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_ATTEMPTS", message: "Too many login attempts. Try again later." } },
});

authRouter.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", loginLimiter, validateBody(loginSchema), asyncHandler(authController.login));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, asyncHandler(authController.me));
authRouter.patch(
  "/password",
  requireAuth,
  validateBody(changePasswordSchema),
  asyncHandler(authController.changePassword)
);
