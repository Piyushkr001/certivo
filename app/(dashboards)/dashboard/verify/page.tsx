// app/dashboard/verify/page.tsx
"use client";

import * as React from "react";
import axios from "axios";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type VerifyResult = {
  id: number;
  code: string;
  holderName: string;
  program: string;
  organizationName?: string | null;
  durationText?: string | null;
  status?: string;
  issuedAt?: string | null;
  verifiedAt?: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardVerifyPage() {
  const [code, setCode] = React.useState("");
  const [issuer, setIssuer] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<VerifyResult | null>(null);

  async function handleVerify(e?: React.FormEvent) {
    if (e) e.preventDefault();

    const trimmed = code.trim();

    if (!trimmed) {
      setError("Please enter a Certificate ID.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const normalizedCode = trimmed.toUpperCase();

      const res = await axios.get<{
        found: boolean;
        certificate?: VerifyResult;
        message?: string;
      }>("/api/verify", {
        params: { code: normalizedCode },
      });

      const data = res.data;

      if (!data.found || !data.certificate) {
        setError(
          data.message ||
            "No certificate found for this ID. Please check the ID and try again."
        );
        return;
      }

      setResult(data.certificate);
    } catch (err: any) {
      console.error("verify error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while verifying. Please try again in a moment.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleVerify();
    }
  }

  const statusBadge =
    result?.status === "verified"
      ? {
          label: "Verified",
          className:
            "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
          icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
        }
      : result?.status === "pending"
      ? {
          label: "Pending",
          className:
            "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
          icon: <AlertTriangle className="mr-1 h-3 w-3" />,
        }
      : result?.status === "rejected"
      ? {
          label: "Rejected",
          className:
            "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
          icon: <AlertTriangle className="mr-1 h-3 w-3" />,
        }
      : result
      ? {
          label: "Active",
          className:
            "bg-slate-500/15 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200",
          icon: null,
        }
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Verify Certificates</h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Verify internship certificates securely, similar to DigiLocker.
            Enter a Certificate ID to view details and ensure authenticity.
          </p>
        </div>
        <Badge className="w-fit bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Secure Verification
        </Badge>
      </div>

      {/* Main content: flex layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Form / filters */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-500" />
              Search Certificate
            </CardTitle>
            <CardDescription className="text-xs">
              Use the unique Certificate ID printed on the document. Optionally,
              filter by issuing organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleVerify}>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Certificate ID
                </label>
                <Input
                  placeholder="e.g. CERT-INT-2025-00123"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="text-sm"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter the exact Certificate ID as printed on the certificate or
                  shared by your institution.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Issuing organization (optional)
                </label>
                <Select
                  value={issuer}
                  onValueChange={(value) => setIssuer(value)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select organization (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any organization</SelectItem>
                    <SelectItem value="tpo">
                      Training &amp; Placement Cell
                    </SelectItem>
                    <SelectItem value="college">
                      College / University Internship Cell
                    </SelectItem>
                    <SelectItem value="company">
                      Partner Company / Organization
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  This filter is for dashboard analytics only. Public verification
                  depends only on the Certificate ID.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Certificate"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setCode("");
                    setIssuer(undefined);
                    setError(null);
                    setResult(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear search
                </button>
              </div>

              {error && (
                <div className="mt-1 rounded-md bg-rose-50 px-3 py-2 text-[11px] text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </div>
              )}

              {!error && !result && !loading && (
                <div className="mt-1 rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
                  You can also use the public verification page to share with
                  external organizations. This view is for your logged-in
                  dashboard.
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Right: Result panel */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-emerald-500" />
              Verification Result
            </CardTitle>
            <CardDescription className="text-xs">
              When a valid certificate is found, its key details appear here,
              similar to how DigiLocker displays verified documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Loading state */}
            {loading && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Verifying certificate ID{" "}
                  <span className="font-mono font-semibold">{code}</span>…
                </p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !result && !error && (
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                <ShieldCheck className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    No certificate selected yet
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Enter a Certificate ID on the left and click{" "}
                    <span className="font-semibold">Verify Certificate</span> to
                    view the verification result here.
                  </p>
                </div>
              </div>
            )}

            {/* Result state */}
            {!loading && result && (
              <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-xs dark:border-slate-700 dark:bg-slate-900/80">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      CERTIVO – Internship Certificate
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      ID: {result.code}
                    </p>
                  </div>
                  {statusBadge && (
                    <Badge
                      className={`flex items-center border-none text-[10px] font-semibold uppercase tracking-wide ${statusBadge.className}`}
                    >
                      {statusBadge.icon}
                      {statusBadge.label}
                    </Badge>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Holder Name
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {result.holderName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Program / Domain
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {result.program}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Organization
                    </p>
                    <p className="text-[11px] text-slate-900 dark:text-slate-100">
                      {result.organizationName || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Duration
                    </p>
                    <p className="text-[11px] text-slate-900 dark:text-slate-100">
                      {result.durationText || "—"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Issued on
                    </p>
                    <p className="text-[11px] text-slate-900 dark:text-slate-100">
                      {formatDate(result.issuedAt)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Last verified
                    </p>
                    <p className="text-[11px] text-slate-900 dark:text-slate-100">
                      {formatDate(result.verifiedAt)}
                    </p>
                  </div>
                </div>

                {/* View & Download button */}
                <div className="flex justify-end pt-1">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/certificate/${encodeURIComponent(
                        result.code
                      )}`}
                      target="_blank"
                    >
                      View &amp; Download Certificate
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-col gap-2 border-t border-dashed border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <p>
                    This certificate has been fetched from your verified Certivo
                    records. Share the Certificate ID with recruiters or
                    institutions so they can independently verify it via the
                    public portal.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-slate-100 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      Read-only view
                    </Badge>
                    <Badge className="bg-slate-100 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      DigiLocker-style verification
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Error state only (if no result) */}
            {!loading && error && !result && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
