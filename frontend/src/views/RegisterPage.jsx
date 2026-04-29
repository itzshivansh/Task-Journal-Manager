import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";
import { useToast } from "../ui/Toast.jsx";

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center p-4">
      <div className="card w-full p-6">
        <div className="mb-6">
          <div className="text-lg font-semibold">Create account</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Your tasks and journal are private to you.
          </div>
        </div>

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();

            // ✅ Basic validation
            if (!email || !username || !displayName || !password) {
              toast.show("Please fill all fields", "error");
              return;
            }

            if (password.length < 8) {
              toast.show("Password must be at least 8 characters", "error");
              return;
            }

            setBusy(true);

            try {
              await register({
                email,
                username,
                displayName,
                password
              });

              toast.show("Account created successfully 🎉", "success");

              navigate("/");
            } catch (err) {
              console.error(err);

              toast.show(
                err?.response?.data?.error ||
                  err?.response?.data?.message ||
                  "Registration failed",
                "error"
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          {/* Email */}
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

          {/* Username + Display */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Username
              </label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Display name
              </label>
              <input
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
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
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Use at least 8 characters.
            </div>
          </div>

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            className="font-medium text-purple-700 hover:underline dark:text-purple-300"
            to="/login"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}