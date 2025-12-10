// app/admin/certificates/page.tsx
"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExcelImportForm } from "./_components/ExcelImportForm";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type AdminCertificate = {
  id: number;
  code: string;
  holderName: string;
  program: string;
  issuedAt: string | null;
  status: string;
  organizationName?: string | null;
};

type IssuedCertificate = AdminCertificate;

type AdminOrganizationOption = {
  id: number;
  name: string;
  type?: string | null;
  isActive?: boolean | null;
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

export default function AdminCertificatesPage() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [issuedAt, setIssuedAt] = useState("");

  const [loadingIssue, setLoadingIssue] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issuedCert, setIssuedCert] = useState<IssuedCertificate | null>(null);

  const [certs, setCerts] = useState<AdminCertificate[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [organizations, setOrganizations] = useState<
    AdminOrganizationOption[]
  >([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const loadCertificates = useCallback(async () => {
    try {
      setLoadingList(true);
      setListError(null);

      const res = await fetch("/api/admin/certificates", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Unable to load certificates.");
      }

      setCerts(data as AdminCertificate[]);
    } catch (err: any) {
      console.error(err);
      setListError(err.message || "Failed to load certificates.");
      setCerts([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadOrganizations = useCallback(async () => {
    try {
      setOrgLoading(true);
      setOrgError(null);

      const res = await fetch("/api/admin/organizations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Unable to load organizations.");
      }

      let orgList = data as AdminOrganizationOption[];

      orgList = orgList.filter(
        (org) =>
          org.isActive === undefined || org.isActive === null || org.isActive
      );

      setOrganizations(orgList);

      if (!selectedOrgId && orgList.length > 0) {
        setSelectedOrgId(String(orgList[0].id));
      }
    } catch (err: any) {
      console.error("Load organizations error:", err);
      setOrgError(err.message || "Failed to load organizations.");
      setOrganizations([]);
      setSelectedOrgId("");
    } finally {
      setOrgLoading(false);
    }
  }, [selectedOrgId]);

  useEffect(() => {
    void loadCertificates();
    void loadOrganizations();
  }, [loadCertificates, loadOrganizations]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIssuedCert(null);

    if (!selectedOrgId) {
      setError("Please select an organization.");
      return;
    }

    const organizationId = Number(selectedOrgId);
    if (!organizationId || Number.isNaN(organizationId)) {
      setError("Invalid organization selected.");
      return;
    }

    try {
      setLoadingIssue(true);

      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, domain, issuedAt, organizationId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to issue certificate.");
      }

      setMessage(data.message || "Certificate issued successfully.");
      setIssuedCert(data.certificate as IssuedCertificate);

      setName("");
      setDomain("");
      setIssuedAt("");
      // keep selectedOrgId for faster repeated issuing

      void loadCertificates();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to issue certificate.");
    } finally {
      setLoadingIssue(false);
    }
  };

  const handleReset = () => {
    setName("");
    setDomain("");
    setIssuedAt("");
    setMessage(null);
    setError(null);
    setIssuedCert(null);
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
              <label className="mb-1 block text-sm font-medium">
                Recipient name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Organization
              </label>

              {orgLoading ? (
                <p className="text-xs text-slate-500">
                  Loading organizations...
                </p>
              ) : orgError ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {orgError} — go to the Organizations page and ensure it’s
                  configured.
                </p>
              ) : organizations.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No organizations found. Add organizations in the Admin &gt;
                  Organizations section first.
                </p>
              ) : (
                <Select
                  value={selectedOrgId}
                  onValueChange={(value) => setSelectedOrgId(value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem
                        key={org.id}
                        value={String(org.id)}
                        className="text-sm"
                      >
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                This links the certificate to the organization for verification
                and reporting.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Domain</label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Issued date
              </label>
              <Input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                className="bg-blue-600 text-white"
                disabled={
                  loadingIssue || orgLoading || organizations.length === 0
                }
              >
                {loadingIssue ? "Issuing..." : "Issue Certificate"}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>

            {message && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            {issuedCert && (
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Latest Issued Certificate
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Certificate ID
                    </p>
                    <p className="font-mono text-[11px] font-medium text-slate-900 dark:text-slate-100">
                      {issuedCert.code}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Recipient
                    </p>
                    <p className="text-[11px] font-medium text-slate-900 dark:text-slate-100">
                      {issuedCert.holderName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Domain
                    </p>
                    <p className="text-[11px] font-medium text-slate-900 dark:text-slate-100">
                      {issuedCert.program}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Status
                    </p>
                    <p className="text-[11px] font-medium capitalize text-slate-900 dark:text-slate-100">
                      {issuedCert.status}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <ExcelImportForm />

      <Card className="overflow-x-auto">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm font-semibold">
            Recently Issued Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600 dark:bg-slate-900/70 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Certificate ID</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loadingList && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm"
                  >
                    Loading certificates...
                  </td>
                </tr>
              )}

              {!loadingList && listError && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-400"
                  >
                    {listError}
                  </td>
                </tr>
              )}

              {!loadingList && !listError && certs?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm"
                  >
                    No certificates issued yet.
                  </td>
                </tr>
              )}

              {!loadingList &&
                !listError &&
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
                      {c.organizationName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(c.issuedAt)}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {c.status || "—"}
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
