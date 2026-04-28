import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";
import { applyTheme } from "../lib/theme.js";
import { getTheme, setTheme } from "../lib/storage.js";
import { useEffect, useState } from "react";

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "block rounded-xl px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-purple-600/90 text-white shadow-sm"
            : "text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-950/40"
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState(getTheme());

  useEffect(() => {
    applyTheme(theme);
    setTheme(theme);
  }, [theme]);

  return (
    <div className="min-h-full">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="hidden w-64 border-r border-slate-200/70 bg-white/70 p-4 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/30 md:block">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-sm" />
              <div>
                <div className="text-sm font-semibold tracking-tight">
                  Task & Journal Manager
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {user?.displayName || user?.username || user?.email}
                </div>
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {/* spacer kept for layout stability */}
             
            </div>
          </div>

          <nav className="space-y-1">
            <NavItem to="/" end>
              Dashboard
            </NavItem>
            <NavItem to="/tasks">To‑Do List</NavItem>
            <NavItem to="/journal">Journal</NavItem>
          </nav>

          <div className="mt-6 space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Theme
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["light", "dark", "system"].map((t) => (
                <button
                  key={t}
                  className={
                    "btn-soft rounded-xl px-2 py-2 text-xs " +
                    (theme === t
                      ? "border-purple-500/60 text-purple-800 dark:text-purple-200"
                      : "")
                  }
                  onClick={() => setThemeState(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button
              className="btn-soft w-full justify-center"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-3xl">
            <Outlet />
          </div>
        </main>
      </div>
       <footer className="fixed bottom-4 right-6 text-xs text-slate-400 dark:text-slate-500 backdrop-blur-sm bg-white/60 dark:bg-slate-900/40 px-3 py-1.5 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-700/50">
  Made for Ice Bear 🐻‍❄️
</footer>
    </div>
    
  );
}

