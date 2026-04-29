import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { clearToken, getToken, setToken } from "../lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function boot() {
      try {
        if (!token) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        const { data } = await api.get("/auth/me");
        if (mounted) setUser(data.user);
      } catch {
        clearToken();
        if (mounted) {
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    boot();
    return () => {
      mounted = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        setToken(data.token);
        setTokenState(data.token);
        setUser(data.user);
      },
      async register(payload) {
        const { data } = await api.post("/auth/register", payload);
        setToken(data.token);
        setTokenState(data.token);
        setUser(data.user);
      },
      logout() {
        clearToken();
        setTokenState(null);
        setUser(null);
      }
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

