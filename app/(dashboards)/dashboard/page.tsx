// app/dashboard/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/auth/AuthContext";

function StatCard({ title, value, note }: { title: string; value: string; note?: string }) {
  return (
    <Card className="border-slate-200/70 dark:border-slate-800">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {note && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back{user?.name ? `, ${user.name}` : ""} 👋</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Your dashboard at a glance.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/verify">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">Verify Certificate</Button>
          </Link>
          <Link href="/dashboard/certificates">
            <Button variant="outline">My Certificates</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Certificates" value="3" note="Total verified certificates" />
        <StatCard title="Last Verified" value="Nov 29, 2025" note="Most recent verification" />
        <StatCard title="Account Type" value={user?.role ?? "user"} note="Role assigned to your account" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Certificates</h2>

        <div className="space-y-3">
          {/* simple responsive list */}
          <div className="flex flex-col gap-3">
            <div className="flex w-full items-center justify-between gap-4 rounded-lg border bg-white/90 p-4 dark:bg-slate-900/80 dark:border-slate-800">
              <div>
                <div className="text-sm font-medium">CERT-INT-2025-00123</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Jane Doe — Web Development</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Verified</Badge>
                <Button asChild size="sm">
                  <Link href="/dashboard/certificates">View</Link>
                </Button>
              </div>
            </div>

            {/* Repeat or map real data here */}
          </div>
        </div>
      </section>
    </div>
  );
}
