import { create } from "zustand";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  storageQuota: number;
  createdAt: string;
}

interface AuthState {
  accessToken: string | null;
  user: CurrentUser | null;
  setSession: (accessToken: string, user: CurrentUser) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
}

// Access token lives only in memory (never localStorage) — the refresh
// token in the httpOnly cookie is what survives a page reload; on boot,
// App.tsx calls /api/auth/refresh to silently re-establish the session.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ accessToken: null, user: null }),
}));
