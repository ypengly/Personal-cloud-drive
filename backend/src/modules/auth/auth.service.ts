import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { env } from "../../config/env";
import type { ChangePasswordInput, LoginInput, RegisterInput } from "./auth.validation";

const SALT_ROUNDS = 12;

function toPublicUser(user: { id: string; email: string; name: string; storageQuota: number; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    storageQuota: user.storageQuota,
    createdAt: user.createdAt,
  };
}

function issueTokens(userId: string, email: string) {
  return {
    accessToken: signAccessToken({ sub: userId, email }),
    refreshToken: signRefreshToken({ sub: userId }),
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw AppError.conflict("An account with this email already exists", "EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        storageQuota: env.defaultStorageQuota,
      },
    });

    const tokens = issueTokens(user.id, user.email);
    return { user: toPublicUser(user), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    // Deliberately identical error for "no such user" and "wrong password"
    // so we don't leak which emails are registered.
    if (!user) {
      throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const tokens = issueTokens(user.id, user.email);
    return { user: toPublicUser(user), ...tokens };
  },

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw AppError.unauthorized("Missing refresh token", "NO_REFRESH_TOKEN");
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized("Invalid or expired refresh token", "REFRESH_TOKEN_INVALID");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw AppError.unauthorized("User no longer exists", "USER_NOT_FOUND");
    }

    return issueTokens(user.id, user.email);
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound("User not found");
    return toPublicUser(user);
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound("User not found");

    const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized("Current password is incorrect", "INVALID_CURRENT_PASSWORD");
    }

    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  },
};
