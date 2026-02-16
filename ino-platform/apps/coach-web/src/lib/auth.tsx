/**
 * Auth context — manages session state, auto-loads tokens on mount,
 * provides login/signup/logout, exposes user to the entire app.
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import api, { tokens } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount: try to restore session from stored tokens
  useEffect(() => {
    tokens.load();
    const { accessToken } = tokens.get();
    if (accessToken) {
      api.auth.me()
        .then(setUser)
        .catch(() => tokens.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      tokens.set(res.access_token, res.refresh_token);
      const me = await api.auth.me();
      setUser(me);
    } catch (e: any) {
      setError(e.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.signup(email, password, name);
      tokens.set(res.access_token, res.refresh_token);
      const me = await api.auth.me();
      setUser(me);
    } catch (e: any) {
      setError(e.message || "Signup failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    tokens.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
