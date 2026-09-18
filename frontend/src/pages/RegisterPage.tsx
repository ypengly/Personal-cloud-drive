import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/auth-store";
import { apiErrorMessage } from "../api/client";
import { AuthField, AuthShell } from "./LoginPage";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, accessToken } = await authApi.register(name, email, password);
      setSession(accessToken, user);
      navigate("/drive");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create account"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Name" type="text" value={name} onChange={setName} autoFocus />
        <AuthField label="Email" type="email" value={email} onChange={setEmail} />
        <AuthField label="Password (min. 8 characters)" type="password" value={password} onChange={setPassword} />
        <button
          disabled={loading}
          className="w-full rounded-md bg-graphite-900 dark:bg-brass-500 text-white text-sm font-medium py-2.5 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-center mt-5 text-graphite-500">
        Already have an account?{" "}
        <Link to="/login" className="text-brass-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
