import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DrivePage } from "./pages/DrivePage";
import { TrashPage } from "./pages/TrashPage";
import { RecentPage } from "./pages/RecentPage";
import { SharedFilePage } from "./pages/SharedFilePage";
import { useAuthStore } from "./store/auth-store";
import { authApi } from "./api/auth";
import { api } from "./api/client";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [checking, setChecking] = useState(!accessToken);

  useEffect(() => {
    if (accessToken) {
      setChecking(false);
      return;
    }
    // On a hard refresh, in-memory state is gone — try the httpOnly refresh
    // cookie to silently re-establish the session before bouncing to login.
    api
      .post("/auth/refresh")
      .then(async ({ data }) => {
        useAuthStore.getState().setAccessToken(data.accessToken);
        const user = await authApi.me();
        useAuthStore.getState().setSession(data.accessToken, user);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-graphite-400 text-sm">Loading…</div>;
  }
  if (!useAuthStore.getState().accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/share/:token" element={<SharedFilePage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/drive" element={<DrivePage />} />
        <Route path="/recent" element={<RecentPage />} />
        <Route path="/trash" element={<TrashPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/drive" replace />} />
      <Route path="*" element={<Navigate to="/drive" replace />} />
    </Routes>
  );
}
