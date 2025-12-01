// app/auth/AuthContext.tsx
"use client";

import React from "react";


type User = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null; // still provided if backend returns it
  isLoading: boolean;
  loginWithCredentials: (email: string, password: string, role: string) => Promise<void>;
  signupWithCredentials: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Hydrate from /api/auth/me (server validates cookie)
  React.useEffect(() => {
    let mounted = true;
    async function hydrate() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (!mounted) return;
        if (data?.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to hydrate auth:", err);
        setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  // Login with email/password: server sets HttpOnly cookie and returns { token, user }
  const loginWithCredentials = async (email: string, password: string, role: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Backend set cookie; hydrate user by calling /api/auth/me
    const me = await fetch("/api/auth/me", { cache: "no-store" });
    const meData = await me.json();
    if (meData?.ok && meData.user) {
      setUser(meData.user);
    } else {
      setUser(null);
    }

    // keep token (optional)
    if (data.token) setToken(data.token);
  };

  const signupWithCredentials = async (name: string, email: string, password: string, role: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    const me = await fetch("/api/auth/me", { cache: "no-store" });
    const meData = await me.json();
    if (meData?.ok && meData.user) {
      setUser(meData.user);
    } else {
      setUser(null);
    }

    if (data.token) setToken(data.token);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    loginWithCredentials,
    signupWithCredentials,
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
