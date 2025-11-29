"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/AuthContext";

type Role = "admin" | "user";

interface GoogleAuthButtonProps {
  role: Role;
  mode: "login" | "signup"; // decides which endpoint to call
}

export function GoogleAuthButton({ role, mode }: GoogleAuthButtonProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const endpoint =
          mode === "login"
            ? "/api/auth/google-login"
            : "/api/auth/google-signup";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: tokenResponse.access_token,
            role,
          }),
        });

        if (!res.ok) {
          // 🔍 better logging to see what's going wrong
          const text = await res.text();
          console.error("Google auth backend error:", res.status, text);

          let message: string | undefined;
          try {
            const data = JSON.parse(text);
            message = data.message;
          } catch {
            // Not JSON (e.g. HTML 404) -> leave message undefined
          }

          setErrorMsg(message || "Google authentication failed");
          throw new Error(message || "Google authentication failed");
        }

        const data = await res.json();
        // backend should return { token: "..." }
        login(data.token);

        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("GoogleAuthButton error:", err);
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google login error (Google side):", err);
      setErrorMsg("Google login popup failed. Please try again.");
    },
  });

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="flex w-full items-center justify-center gap-2 border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
        onClick={() => googleLogin()}
        disabled={loading}
      >
        <span className="text-lg">G</span>
        <span className="text-sm">
          {mode === "login" ? "Continue with Google" : "Sign up with Google"}
        </span>
      </Button>

      {errorMsg && (
        <p className="text-[11px] text-red-500">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
