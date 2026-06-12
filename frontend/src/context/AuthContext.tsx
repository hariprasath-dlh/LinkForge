import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "../api/axios";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "linkforge_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {}
    setLoading(false);
  }, []);

  const persist = (u: User, t: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
    setUser(u); setToken(t);
  };

  const login: AuthState["login"] = async (email, password) => {
    const data = await apiFetch<{
      success: boolean;
      message: string;
      token: string;
      user: { id: string; name: string; email: string };
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    persist(data.user, data.token);
  };

  const register: AuthState["register"] = async (name, email, password) => {
    const data = await apiFetch<{
      success: boolean;
      message: string;
      token: string;
      user: { id: string; name: string; email: string };
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    persist(data.user, data.token);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null); setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
