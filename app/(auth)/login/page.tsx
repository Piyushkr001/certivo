"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/auth/AuthContext";
import { GoogleAuthButton } from "../_components/GoogleAuthButton";

type Role = "admin" | "user";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = React.useState<Role>("user");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Login failed");
      }

      const data = await res.json(); // { token: string, ... }
      login(data.token);

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-linear-to-b from-slate-50 via-white to-slate-100 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* Left side info */}
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Welcome back to{" "}
            <span className="bg-linear-to-r from-blue-600 via-sky-500 to-emerald-400 bg-clip-text font-bold text-transparent">
              Certivo
            </span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Sign in to manage internship certificates as an admin or verify
            your certificates as a user.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>• Admins can upload and manage certificate records.</li>
            <li>• Users can quickly verify their internship certificates.</li>
          </ul>
        </div>

        {/* Right side card */}
        <Card className="w-full max-w-md border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 dark:border-slate-700/70 dark:bg-slate-900/90 dark:shadow-slate-950/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              Login to your account
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your role and sign in with email or Google.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role selector */}
            <div className="flex gap-2 rounded-lg bg-slate-100 p-1 text-xs dark:bg-slate-800/70">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={cn(
                  "flex-1 rounded-md py-2 text-center font-medium transition",
                  role === "user"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50"
                    : "text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-700/70"
                )}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={cn(
                  "flex-1 rounded-md py-2 text-center font-medium transition",
                  role === "admin"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50"
                    : "text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-700/70"
                )}
              >
                Admin
              </button>
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/90 dark:bg-slate-900/80"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/90 dark:bg-slate-900/80"
                  required
                />
              </div>

              {error && (
                <p className="text-xs font-medium text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            {/* Or divider */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span>Or continue with</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            <GoogleAuthButton role={role} mode="login" />

            <p className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:underline dark:text-blue-300"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
