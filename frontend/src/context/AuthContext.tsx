import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { api, safeRequest } from "@/lib/api";
import { mockDb, Role, UserRecord } from "@/lib/mockDb";

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: Role;
  approved?: boolean;
  service?: string;
  specialization?: string;
  is_approved?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<AuthUser>;
  register: (data: { name: string; email: string; password: string; role: Role; phone?: string; service?: string }) => Promise<AuthUser>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "hs_token";
const USER_KEY = "hs_user";

function fakeToken(u: UserRecord) {
  return btoa(`${u.id}:${u.role}:${Date.now()}`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const persist = (u: AuthUser, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string, role: Role) => {
    const data = await safeRequest<{ token: string; user: AuthUser }>(
      () => api.post("/auth/login", { email, password, role }),
      () => {
        const found = mockDb.findByEmail(email);
        if (!found || found.password !== password) throw new Error("Invalid email or password.");
        if (found.role !== role) throw new Error(`This account is not registered as a ${role}.`);
        const u: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role, approved: found.approved, service: found.service };
        return { token: fakeToken(found), user: u };
      },
    );
    persist(data.user, data.token);
    return data.user;
  }, []);

  const register = useCallback(async (input: { name: string; email: string; password: string; role: Role; phone?: string; service?: string }) => {
    const data = await safeRequest<{ token: string; user: AuthUser }>(
      () => api.post("/auth/register", input),
      () => {
        const created = mockDb.register(input);
        const u: AuthUser = { id: created.id, name: created.name, email: created.email, role: created.role, approved: created.approved, service: created.service };
        return { token: fakeToken(created), user: u };
      },
    );
    persist(data.user, data.token);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
