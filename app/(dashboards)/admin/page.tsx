// app/admin/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/AuthContext";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Manage certificates and interns.</p>
        </div>
        <div>
          <Link href="/admin/certificates">
            <Button className="bg-blue-600 text-white">Issue Certificate</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStat title="Total Certificates" value="5,240" />
        <AdminStat title="Pending Verifications" value="14" />
        <AdminStat title="Active Admins" value="3" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Activity</h2>
        <div className="space-y-3">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">CERT-INT-2025-01234 issued</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Issued to John Doe</div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">2 hours ago</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
