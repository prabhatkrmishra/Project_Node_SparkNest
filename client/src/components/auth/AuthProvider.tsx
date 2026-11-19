import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";

import { api } from "../../api/API";
import type { User } from "../../types/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => null,
});

function readCachedUser(): User | null {
  const raw = Cookies.get("sessionUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function clearSessionHints() {
  Cookies.remove("sessionLogged");
  Cookies.remove("sessionUser");
}

/**
 * Single source of truth for the signed-in user. The client-side cookies are
 * only a hint for fast first paint; the server session is authoritative and is
 * revalidated with GET /auth/me on every full load.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readCachedUser());
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      const nextUser = response.data?.user ?? null;
      if (!mountedRef.current) return nextUser;
      setUser(nextUser);
      if (nextUser) {
        Cookies.set("sessionLogged", "true", { expires: 30 });
        Cookies.set("sessionUser", JSON.stringify(nextUser), { expires: 30 });
      } else {
        clearSessionHints();
      }
      return nextUser;
    } catch (error: any) {
      if (!mountedRef.current) return null;
      if (error?.response?.status === 401) {
        setUser(null);
        clearSessionHints();
      }
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const value = useMemo(() => ({ user, loading, refresh }), [user, loading, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
