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

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // only load if we know user is defined
    if (!user) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/user/certificates", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // JWT cookie is sent automatically by the browser
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data?.message || "Unable to load certificates right now."
          );
        }

        const data = (await res.json()) as Certificate[];
        setCerts(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong.");
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
          <CardTitle className="text-sm font-semibold">
            Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600 dark:bg-slate-900/70 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Certificate ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && certs?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm">
                    No certificates found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                certs?.map((c) => (
                  <tr
                    key={c.id}
                    className="bg-white text-sm dark:bg-slate-900/80"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {c.code}
                    </td>
                    <td className="px-4 py-3">{c.holderName}</td>
                    <td className="px-4 py-3">{c.program}</td>
                    <td className="px-4 py-3">
                      {formatDate(c.issuedAt)}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {c.status || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="ghost">
                          <Link
                            href={`/certificate/${encodeURIComponent(c.code)}`}
                            target="_blank"
                          >
                            View Certificate
                          </Link>
                        </Button>
                      </div>
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
