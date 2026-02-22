import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthUser } from "../types/Head";

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isMechanic: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
  isMechanic: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("authUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  const login = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem("authUser", JSON.stringify(u));
    localStorage.setItem("token", u.accessToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("token");
  };

  const isAdmin = user?.role === "Administrator";
  const isMechanic = user?.role === "Mechanic";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isMechanic }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
