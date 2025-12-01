// app/admin/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/AuthContext";

type AdminStats = {
  totalCertificates: number;
  pendingVerifications: number;
  activeAdmins: number;
};

type RecentActivity = {
  id: number | string;
  title: string;     // e.g. "CERT-INT-2025-01234 issued"
  subtitle: string;  // e.g. "Issued to John Doe"
  timeAgo: string;   // e.g. "2 hours ago"
};

function AdminStat({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-slate-200/70 dark:border-slate-800">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4">
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { user } = useAuth();

  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = React.useState<RecentActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchAdminOverview() {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("/api/admin/overview", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (cancelled) return;

        const data = res.data as {
          stats: AdminStats;
          recentActivity: RecentActivity[];
        };

        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } catch (err) {
        if (cancelled) return;
        console.error("Admin dashboard error:", err);
        setError("Failed to load admin dashboard data. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAdminOverview();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCertificates = stats?.totalCertificates ?? 0;
  const pendingVerifications = stats?.pendingVerifications ?? 0;
  const activeAdmins = stats?.activeAdmins ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Admin Dashboard{user?.name ? ` — ${user.name}` : ""}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Manage certificates and interns.
          </p>
        </div>
        <div>
          <Link href="/admin/certificates">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Issue Certificate
            </Button>
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
        <AdminStat
          title="Total Certificates"
          value={loading ? "…" : totalCertificates.toLocaleString()}
        />
        <AdminStat
          title="Pending Verifications"
          value={loading ? "…" : pendingVerifications.toString()}
        />
        <AdminStat
          title="Active Admins"
          value={loading ? "…" : activeAdmins.toString()}
        />
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Activity</h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60"
              />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No recent activity yet. New certificate actions will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex flex-col items-start justify-between gap-2 py-3 text-sm md:flex-row md:items-center">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.subtitle}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 md:text-right">
                    {item.timeAgo}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
