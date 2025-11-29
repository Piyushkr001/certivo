// app/admin/certificates/page.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminCertificatesPage() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      // call your API to create certificate
      // const res = await fetch('/api/admin/certificates', { method: 'POST', body: JSON.stringify({ name, domain, issuedAt }) });
      // const data = await res.json();

      // demo success:
      setTimeout(() => {
        setMessage("Certificate issued successfully (demo).");
        setLoading(false);
      }, 900);
    } catch (err) {
      setMessage("Failed to issue certificate.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Issue Certificate</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">New Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={handleIssue}>
            <div>
              <label className="mb-1 block text-sm font-medium">Recipient name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Domain</label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Issued date</label>
              <Input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} required />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" className="bg-blue-600 text-white" disabled={loading}>
                {loading ? "Issuing..." : "Issue Certificate"}
              </Button>
              <Button variant="outline" onClick={() => { setName(""); setDomain(""); setIssuedAt(""); }}>
                Reset
              </Button>
            </div>

            {message && <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
