// app/dashboard/page.tsx
"use client";

import * as React from "react";
import axios from "axios";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/auth/AuthContext";

type DashboardStats = {
  totalCertificates: number;
  lastVerifiedAt: string | null;
  accountType: string;
};

type CertificateStatus = "verified" | "pending" | "rejected";

type RecentCertificate = {
  id: number | string;
  code: string; // e.g. "CERT-INT-2025-00123"
  holderName: string; // e.g. "Jane Doe"
  program: string; // e.g. "Web Development"
  status: CertificateStatus;
};

function StatCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note?: string;
}) {
  return (
    <Card className="border-slate-200/70 dark:border-slate-800">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {note && (
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {note}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentCertificates, setRecentCertificates] = React.useState<
    RecentCertificate[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("/api/dashboard/overview", {
          // cookies (JWT) are sent automatically by the browser
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (cancelled) return;

        const data = res.data as {
          stats: DashboardStats;
          recentCertificates: RecentCertificate[];
        };

        setStats(data.stats);
        setRecentCertificates(data.recentCertificates || []);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load dashboard:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const accountType =
    user?.role || stats?.accountType || "user";

  const totalCertificates = stats?.totalCertificates ?? 0;
  const lastVerifiedLabel = formatDate(stats?.lastVerifiedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your dashboard at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/verify">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Verify Certificate
            </Button>
          </Link>
          <Link href="/dashboard/certificates">
            <Button variant="outline">My Certificates</Button>
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Certificates"
          value={loading ? "…" : String(totalCertificates)}
          note="Total certificates linked to your account"
        />
        <StatCard
          title="Last Verified"
          value={loading ? "…" : lastVerifiedLabel}
          note="Most recent verification date"
        />
        <StatCard
          title="Account Type"
          value={loading ? "…" : accountType}
          note="Role assigned to your account"
        />
      </div>

      {/* Recent certificates */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Certificates</h2>

        {loading ? (
          // simple skeleton-ish loading state
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"
              />
            ))}
          </div>
        ) : recentCertificates.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No certificates found yet. Once your certificates are added, they
            will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {recentCertificates.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col gap-3 rounded-lg border bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="text-sm font-medium">{cert.code}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {cert.holderName} — {cert.program}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    className={
                      cert.status === "verified"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : cert.status === "pending"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "bg-red-500/10 text-red-700 dark:text-red-300"
                    }
                  >
                    {cert.status.charAt(0).toUpperCase() +
                      cert.status.slice(1)}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/dashboard/certificates/${cert.id}`}
                    >
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
