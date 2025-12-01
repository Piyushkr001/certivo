"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import axios from "axios";

type Role = "admin" | "user";

interface GoogleAuthButtonProps {
  role: Role;
  mode: "login" | "signup"; // decides which endpoint to call
}

export function GoogleAuthButton({ role, mode }: GoogleAuthButtonProps) {
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

        const res = await axios.post(
          endpoint,
          {
            accessToken: tokenResponse.access_token,
            role,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = res.data;

        // backend sets HttpOnly cookie; we just need to redirect
        if (!res.status || res.status >= 400) {
          throw new Error(data?.message || "Google authentication failed");
        }

        // Force full reload so AuthProvider re-hydrates from /api/auth/me
        const target = role === "admin" ? "/admin" : "/dashboard";
        if (typeof window !== "undefined") {
          window.location.href = target;
        } else {
          router.push(target);
        }
      } catch (err: any) {
        console.error("GoogleAuthButton error:", err);

        if (axios.isAxiosError(err)) {
          const msg =
            (err.response?.data as any)?.message ||
            err.message ||
            "Google authentication failed";
          setErrorMsg(msg);
        } else {
          setErrorMsg(err?.message || "Google authentication failed");
        }
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
