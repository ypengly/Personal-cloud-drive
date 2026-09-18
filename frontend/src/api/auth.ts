import { api } from "./client";
import type { CurrentUser } from "../store/auth-store";

export const authApi = {
  async register(name: string, email: string, password: string) {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data as { user: CurrentUser; accessToken: string };
  },
  async login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    return data as { user: CurrentUser; accessToken: string };
  },
  async logout() {
    await api.post("/auth/logout");
  },
  async me() {
    const { data } = await api.get("/auth/me");
    return data.user as CurrentUser;
  },
  async changePassword(currentPassword: string, newPassword: string) {
    await api.patch("/auth/password", { currentPassword, newPassword });
  },
};
