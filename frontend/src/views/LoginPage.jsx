import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";
import { useToast } from "../ui/Toast.jsx";

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center p-4">
      <div className="card w-full p-6">
        <div className="mb-6">
          <div className="text-lg font-semibold">Welcome back</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage your tasks and journal.
          </div>
        </div>

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();

            if (!email || !password) {
              toast.show("Please enter email and password", "error");
              return;
            }

            setBusy(true);

            try {
              await login(email, password);

              toast.show("Login successful 🎉", "success");

              navigate("/");
            } catch (err) {
              console.error(err);

              toast.show(
                err?.response?.data?.error ||
                  err?.response?.data?.message ||
                  "Login failed",
                "error"
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Email
            </label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          New here?{" "}
          <Link
            className="font-medium text-purple-700 hover:underline dark:text-purple-300"
            to="/register"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}