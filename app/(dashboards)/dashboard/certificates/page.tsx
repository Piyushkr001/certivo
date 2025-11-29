// app/dashboard/certificates/page.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/AuthContext";

type Certificate = {
  id: string;
  name: string;
  domain: string;
  issuedAt: string;
  status: "verified" | "pending";
};

export default function CertificatesPage() {
  const { token } = useAuth();
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Replace with your real API
    async function load() {
      setLoading(true);
      try {
        // Example fetch — you should send Authorization if needed
        // const res = await fetch('/api/user/certificates', { headers: { Authorization: `Bearer ${token}` } });
        // const data = await res.json();
        // setCerts(data);
        // Demo static:
        setCerts([
          { id: "CERT-001", name: "Jane Doe", domain: "Web Development", issuedAt: "2025-03-15", status: "verified" },
          { id: "CERT-002", name: "John Smith", domain: "Data Science", issuedAt: "2025-05-22", status: "pending" },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">My Certificates</h1>
        <Link href="/verify">
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
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-6 text-center">Loading...</td></tr>
              )}

              {!loading && certs?.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center">No certificates found.</td></tr>
              )}

              {!loading &&
                certs?.map((c) => (
                  <tr key={c.id} className="bg-white dark:bg-slate-900/80">
                    <td className="px-4 py-3 text-sm">{c.id}</td>
                    <td className="px-4 py-3 text-sm">{c.name}</td>
                    <td className="px-4 py-3 text-sm">{c.domain}</td>
                    <td className="px-4 py-3 text-sm">{c.issuedAt}</td>
                    <td className="px-4 py-3 text-sm">{c.status}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/certificates/${c.id}`}>
                          <Button size="sm" variant="ghost">View</Button>
                        </Link>
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
