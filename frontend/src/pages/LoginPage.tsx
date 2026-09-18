import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HardDrive } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/auth-store";
import { apiErrorMessage } from "../api/client";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, accessToken } = await authApi.login(email, password);
      setSession(accessToken, user);
      navigate("/drive");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Email" type="email" value={email} onChange={setEmail} autoFocus />
        <AuthField label="Password" type="password" value={password} onChange={setPassword} />
        <button
          disabled={loading}
          className="w-full rounded-md bg-graphite-900 dark:bg-brass-500 text-white text-sm font-medium py-2.5 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-center mt-5 text-graphite-500">
        Don't have an account?{" "}
        <Link to="/register" className="text-brass-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-graphite-50 dark:bg-graphite-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded bg-graphite-900 dark:bg-brass-500 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="font-sans font-semibold text-2xl text-graphite-900 dark:text-graphite-50">Vault</span>
        </div>
        <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-lg p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  type,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-graphite-600 dark:text-graphite-300">{label}</span>
      <input
        type={type}
        required
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 px-3 py-2 text-sm outline-none focus:border-brass-500"
      />
    </label>
  );
}
