import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "../api/axios";
import type { User } from "../types/User";

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithToken: (token: string, refreshToken?: string) => Promise<User>;
  logout: () => Promise<void>;
  setPassword: (
    newPassword: string,
    confirmNewPassword: string,
  ) => Promise<void>;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken"),
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        setAccessToken(storedToken);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "accessToken" && !event.newValue) {
        setAccessToken(null);
        setUser(null);
        window.location.href = "/login";
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken: newToken, refreshToken } = res.data;

    localStorage.setItem("accessToken", newToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    setAccessToken(newToken);

    const me = await api.get("/auth/me");
    setUser(me.data);
    return me.data as User;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setUser(null);
  };

  const loginWithToken = async (token: string, refreshToken?: string) => {
    localStorage.setItem("accessToken", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    setAccessToken(token);

    const me = await api.get("/auth/me");
    setUser(me.data);
    return me.data as User;
  };

  const setPassword = async (
    newPassword: string,
    confirmNewPassword: string,
  ) => {
    await api.post("/auth/setPassword", { newPassword, confirmNewPassword });
    setUser((prev) => (prev ? { ...prev, hasPassword: true } : prev));
  };

  const hasPermission = (permission: string) =>
    !!user?.permissions?.includes(permission);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated: !!accessToken,
        isLoading,
        loginWithToken,
        login,
        logout,
        setPassword,
        isAdmin: user?.role === "ADMIN",
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used in AuthProvider");
  return context;
}