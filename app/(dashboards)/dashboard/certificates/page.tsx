// app/dashboard/certificates/page.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/AuthContext";

type Certificate = {
  id: number;
  code: string;
  holderName: string;
  program: string;
  issuedAt: string | null;
  status: "verified" | "pending" | "rejected" | string;
  organizationName?: string | null;
  durationText?: string | null;
};

type CertificatesResponse =
  | Certificate[]
  | {
      message?: string;
      certificates?: Certificate[];
      pagination?: { limit?: number; offset?: number; count?: number };
    };

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function safeReadJson<T = any>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function CertificatesPage() {
  const { user } = useAuth();

  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCerts(null);
      setError(null);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/user/certificates", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await safeReadJson<CertificatesResponse>(res);

        if (!res.ok) {
          const msg =
            (data as any)?.message ||
            `Unable to load certificates (HTTP ${res.status}).`;
          throw new Error(msg);
        }

        const list = Array.isArray(data)
          ? data
          : ((data as any)?.certificates ?? []);

        setCerts(list);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Something went wrong.");
        setCerts([]);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">My Certificates</h1>
        <Link href="/dashboard/verify">
          <Button>Verify New</Button>
        </Link>
      </div>

      <Card className="overflow-x-auto">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm font-semibold">Certificates</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <table className="min-w-full">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600 dark:bg-slate-900/70 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Certificate ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {!user && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm">
                    Please login to view your certificates.
                  </td>
                </tr>
              )}

              {user && loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm">
                    Loading...
                  </td>
                </tr>
              )}

              {user && !loading && error && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {user && !loading && !error && certs?.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm">
                    No certificates found.
                  </td>
                </tr>
              )}

              {user &&
                !loading &&
                !error &&
                certs?.map((c) => (
                  <tr
                    key={c.id}
                    className="bg-white text-sm dark:bg-slate-900/80"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                    <td className="px-4 py-3">{c.holderName}</td>
                    <td className="px-4 py-3">{c.program}</td>
                    <td className="px-4 py-3">{c.organizationName || "—"}</td>
                    <td className="px-4 py-3">{c.durationText || "—"}</td>
                    <td className="px-4 py-3">{formatDate(c.issuedAt)}</td>
                    <td className="px-4 py-3 capitalize">{c.status || "—"}</td>
                    <td className="px-4 py-3">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={`/certificate/${encodeURIComponent(c.code)}`}
                          target="_blank"
                        >
                          View Certificate
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
