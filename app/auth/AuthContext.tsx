"use client";

import React from "react";

type JwtPayload = {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
};

type User = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (jwt: string) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

const TOKEN_KEY = "certivo_token";

// Simple JWT decoder using atob (client-side only)
function decodeJwt(token: string): JwtPayload {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (err) {
    console.error("Failed to decode JWT", err);
    throw new Error("Invalid JWT");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem(TOKEN_KEY)
          : null;

      if (stored) {
        const decoded = decodeJwt(stored);

        // Check expiry if present
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          window.localStorage.removeItem(TOKEN_KEY);
        } else {
          setToken(stored);
          setUser({
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
          });
        }
      }
    } catch (err) {
      console.error("Failed to parse stored JWT", err);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (jwt: string) => {
    try {
      const decoded = decodeJwt(jwt);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(TOKEN_KEY, jwt);
      }

      setToken(jwt);
      setUser({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      });
    } catch (err) {
      console.error("Invalid JWT passed to login()", err);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
