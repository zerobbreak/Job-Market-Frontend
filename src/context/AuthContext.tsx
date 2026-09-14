import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, useRouteContext } from "@tanstack/react-router";
import { loginFn, logoutFn, registerFn } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * User/session state comes from the root route's `beforeLoad` (server-verified,
 * no client fetch/flash). This provider just exposes it plus the auth actions,
 * which call server functions and then invalidate the router so `beforeLoad`
 * re-runs and picks up the fresh session.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useRouteContext({ from: "__root__" }) as { user: SessionUser | null };
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const login = async (email: string, password: string) => {
    setPending(true);
    try {
      await loginFn({ data: { email, password } });
      await router.invalidate();
    } finally {
      setPending(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setPending(true);
    try {
      await registerFn({ data: { email, password, name } });
      await router.invalidate();
    } finally {
      setPending(false);
    }
  };

  const logout = async () => {
    setPending(true);
    try {
      await logoutFn();
      await router.invalidate();
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading: pending, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
