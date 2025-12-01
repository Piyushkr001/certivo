// app/dashboard/certificates/[id]/page.tsx
"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Certificate = {
  id: number;
  code: string;
  holderName: string;
  program: string;
  organizationName?: string | null;
  durationText?: string | null;
  status: "verified" | "pending" | "rejected" | string;
  issuedAt: string | null;
  verifiedAt: string | null;
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

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optional: ref if you later want a more advanced “print only this” solution
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      setError(null);
      setCertificate(null);
      try {
        const res = await fetch(`/api/user/certificates/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Unable to load certificate.");
        }

        setCertificate(data as Certificate);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id]);

  const statusBadge =
    certificate?.status === "verified"
      ? {
          label: "Verified",
          className:
            "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
        }
      : certificate?.status === "pending"
      ? {
          label: "Pending",
          className:
            "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
        }
      : certificate?.status === "rejected"
      ? {
          label: "Rejected",
          className:
            "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
        }
      : certificate
      ? {
          label: "Active",
          className:
            "bg-slate-500/15 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200",
        }
      : null;

  function handleDownloadPdf() {
    if (!certificate) return;
    // Simple + reliable: user can choose "Save as PDF" in print dialog
    window.print();
  }

  return (
    <div className="space-y-4 print:bg-white print:text-black print:p-6">
      {/* Top bar – hidden in print */}
      <div className="flex items-center justify-between gap-2 print:hidden">
        <h1 className="text-lg font-semibold">Certificate Details</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="text-sm"
          >
            Back
          </Button>
          <Button
            variant="outline"
            className="text-sm"
            onClick={handleDownloadPdf}
            disabled={!certificate}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Printable area */}
      <Card
        ref={printAreaRef}
        className="max-w-2xl border-slate-200 bg-white shadow-sm print:shadow-none print:border-slate-300 print:mx-auto"
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2 border-b border-slate-200/70 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">
              {certificate ? certificate.holderName : "Certificate"}
            </CardTitle>
            {certificate && (
              <>
                <p className="mt-1 text-xs text-slate-500">
                  Certificate ID{" "}
                  <span className="font-mono font-medium">
                    {certificate.code}
                  </span>
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  CERTIVO – Internship Certificate
                </p>
              </>
            )}
          </div>
          {statusBadge && (
            <Badge
              className={`border-none text-[10px] font-semibold uppercase tracking-wide ${statusBadge.className}`}
            >
              {statusBadge.label}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6 p-5 text-sm">
          {loading && (
            <p className="text-sm text-slate-600 dark:text-slate-300 print:text-slate-800">
              Loading certificate…
            </p>
          )}

          {!loading && error && (
            <p className="text-sm text-red-600 dark:text-red-400 print:text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && !certificate && (
            <p className="text-sm text-slate-600 dark:text-slate-300 print:text-slate-800">
              Certificate not found.
            </p>
          )}

          {!loading && !error && certificate && (
            <>
              {/* Recipient & program */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 print:text-slate-600">
                    Awarded To
                  </p>
                  <p className="text-base font-semibold text-slate-900 print:text-slate-900">
                    {certificate.holderName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 print:text-slate-600">
                    Program / Domain
                  </p>
                  <p className="text-sm font-medium text-slate-900 print:text-slate-900">
                    {certificate.program}
                  </p>
                </div>
              </div>

              {/* Organization / duration */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 print:text-slate-600">
                    Organization
                  </p>
                  <p className="text-sm text-slate-900 print:text-slate-900">
                    {certificate.organizationName || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 print:text-slate-600">
                    Duration
                  </p>
                  <p className="text-sm text-slate-900 print:text-slate-900">
                    {certificate.durationText || "—"}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 print:text-slate-600">
                    Issued on
                  </p>
                  <p className="text-sm text-slate-900 print:text-slate-900">
                    {formatDate(certificate.issuedAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 print:text-slate-600">
                    Last verified
                  </p>
                  <p className="text-sm text-slate-900 print:text-slate-900">
                    {formatDate(certificate.verifiedAt)}
                  </p>
                </div>
              </div>

              {/* Footer note – hidden in print */}
              <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 print:hidden">
                This certificate view is only visible inside your Certivo
                account. For external validation, use the public verification
                portal with the Certificate ID shown above.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Small hint for user – hidden in print */}
      <p className="text-xs text-slate-500 dark:text-slate-400 print:hidden">
        Tip: When you click <span className="font-semibold">Download PDF</span>,
        choose <span className="font-semibold">“Save as PDF”</span> in your
        browser&apos;s print dialog to save a copy.
      </p>
    </div>
  );
}
