"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Instant Verification",
    description:
      "Students can verify internship certificates in seconds using a unique Certificate ID.",
  },
  {
    title: "Excel Import for Admins",
    description:
      "Upload Excel files once and let Certivo handle structured, validated storage in the system.",
  },
  {
    title: "Secure & Trusted",
    description:
      "Role-based access, secure authentication, and data integrity baked into the system.",
  },
];

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function LandingPage() {
  const [code, setCode] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verifyError, setVerifyError] = React.useState<string | null>(null);
  const [verifyResult, setVerifyResult] = React.useState<null | {
    code: string;
    holderName: string;
    program: string;
    organizationName?: string | null;
    durationText?: string | null;
    status?: string;
    issuedAt?: string | null;
    verifiedAt?: string | null;
  }>(null);

  async function handleVerify() {
    const trimmed = code.trim();

    if (!trimmed) {
      setVerifyError("Please enter a Certificate ID.");
      setVerifyResult(null);
      return;
    }

    try {
      setIsVerifying(true);
      setVerifyError(null);
      setVerifyResult(null);

      const res = await fetch(
        `/api/verify?code=${encodeURIComponent(trimmed)}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.found) {
        setVerifyError(
          data?.message ||
            "No certificate found for this ID. Please check and try again."
        );
        return;
      }

      setVerifyResult(data.certificate);
    } catch (error) {
      console.error("verify error:", error);
      setVerifyError(
        "Something went wrong while verifying. Please try again in a moment."
      );
    } finally {
      setIsVerifying(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleVerify();
    }
  }

  const statusLabel =
    verifyResult?.status === "verified"
      ? { text: "Verified", tone: "verified" as const }
      : verifyResult?.status === "rejected"
      ? { text: "Rejected", tone: "rejected" as const }
      : verifyResult?.status === "pending"
      ? { text: "Pending", tone: "pending" as const }
      : verifyResult
      ? { text: "Active", tone: "verified" as const }
      : null;

  return (
    <main
      className={cn(
        "min-h-screen",
        "bg-linear-to-b from-slate-50 via-white to-slate-100",
        "dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
        "text-slate-900 dark:text-slate-100"
      )}
    >
      {/* Hero Section */}
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 md:flex-row md:items-center md:justify-between md:pt-16">
        {/* Left: Text + CTAs */}
        <div className="flex max-w-xl flex-col gap-6">
          <Badge className="w-fit bg-blue-600/10 text-xs font-medium uppercase tracking-wide text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
            Certificate Verification System
          </Badge>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Verify{" "}
              <span className="bg-linear-to-r from-blue-600 via-sky-500 to-emerald-400 bg-clip-text font-bold text-transparent">
                Internship Certificates
              </span>{" "}
              with confidence.
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Certivo helps institutions issue, manage, and verify internship
              certificates online. Admins upload data once. Students verify
              anytime, anywhere.
            </p>
          </div>

          {/* Quick verify form */}
          <div className="mt-2 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Quick Certificate Lookup
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Enter Certificate ID"
                className="bg-white/90 text-sm dark:bg-slate-900/80"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isVerifying}
              />
              <Button
                className="w-full bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Now"}
              </Button>
            </div>
            {verifyError && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {verifyError}
              </p>
            )}
            {!verifyError && !verifyResult && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your Certificate ID to instantly verify and view basic
                details of your internship certificate.
              </p>
            )}

            {verifyResult && (
              <div className="mt-2 rounded-md border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/80">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Verification Result
                    </p>
                    <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      ID: {verifyResult.code}
                    </p>
                  </div>
                  {statusLabel && (
                    <Badge
                      className={cn(
                        "border-none text-[10px] font-semibold uppercase tracking-wide",
                        statusLabel.tone === "verified" &&
                          "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
                        statusLabel.tone === "pending" &&
                          "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
                        statusLabel.tone === "rejected" &&
                          "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                      )}
                    >
                      {statusLabel.text}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Awarded To
                    </p>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-50">
                      {verifyResult.holderName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Program / Domain
                    </p>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-50">
                      {verifyResult.program}
                    </p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Organization
                    </p>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200">
                      {verifyResult.organizationName || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Duration
                    </p>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200">
                      {verifyResult.durationText || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-200 pt-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <div>
                    <p>Issued on</p>
                    <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(verifyResult.issuedAt ?? null)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>Last verified</p>
                    <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(verifyResult.verifiedAt ?? null)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <Button
              asChild
              className="w-full bg-blue-600 text-sm font-medium text-white shadow-md shadow-blue-500/30 hover:bg-blue-700 sm:w-auto"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-300 text-sm text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-900 sm:w-auto"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                5K+
              </span>
              <span className="text-xs uppercase tracking-wide">
                Certificates Managed
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                99.9%
              </span>
              <span className="text-xs uppercase tracking-wide">
                Uptime & Reliability
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                2x
              </span>
              <span className="text-xs uppercase tracking-wide">
                Faster Verification
              </span>
            </div>
          </div>
        </div>

        {/* Right: Mock certificate / preview */}
        <div className="relative mt-4 flex flex-1 items-center justify-center md:mt-0">
          {/* Subtle glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.35),transparent_60%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.3),transparent_55%)] opacity-70 dark:opacity-90" />

          <Card className="w-full max-w-sm border-slate-200/60 bg-white/95 shadow-xl shadow-slate-300/50 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-slate-900/60">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    CERTIVO
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Internship Certificate
                  </p>
                </div>
                <Badge className="bg-emerald-500/10 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  Verified
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Certificate ID
                </p>
                <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-100">
                  CERT-INT-2025-00123
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Awarded To
                </p>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  Jane Doe
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Internship Domain
                  </p>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                    Web Development
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Duration
                  </p>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                    Jan 2025 – Mar 2025
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <div>
                  <p>Issued by</p>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                    Training & Internship Cell
                  </p>
                </div>
                <div className="text-right">
                  <p>Verified on</p>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                    29 Nov 2025
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Built for institutions and students
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Certivo streamlines certificate verification so that admin teams
              spend less time checking records and students get instant, trusted
              validation.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="text-sm border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <Link href="/services">Explore Services</Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="h-full border-slate-200/70 bg-white/80 shadow-sm hover:shadow-md hover:shadow-blue-500/10 dark:border-slate-700/70 dark:bg-slate-900/80"
            >
              <CardContent className="flex h-full flex-col gap-3 p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-col gap-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                How Certivo works
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                A simple two-sided flow for admins and students keeps everything
                transparent, secure, and easy to use.
              </p>
            </div>
            <Badge className="w-fit bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
              Admin & Student Flows
            </Badge>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Admin Flow */}
            <div className="flex-1 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm dark:border-slate-700/80 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
                For Admins
              </h3>
              <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li>
                  <span className="font-semibold text-blue-600 dark:text-blue-300">
                    1. Login securely:
                  </span>{" "}
                  Sign in to your admin dashboard.
                </li>
                <li>
                  <span className="font-semibold text-blue-600 dark:text-blue-300">
                    2. Upload Excel:
                  </span>{" "}
                  Import student certificate details in bulk.
                </li>
                <li>
                  <span className="font-semibold text-blue-600 dark:text-blue-300">
                    3. Validate & store:
                  </span>{" "}
                  Certivo validates records and saves them in the database.
                </li>
                <li>
                  <span className="font-semibold text-blue-600 dark:text-blue-300">
                    4. Monitor verifications:
                  </span>{" "}
                  Track usage and verification logs from the dashboard.
                </li>
              </ol>
            </div>

            {/* Student Flow */}
            <div className="flex-1 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm dark:border-slate-700/80 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
                For Students
              </h3>
              <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                    1. Visit verification page:
                  </span>{" "}
                  Go to the public Certivo verify portal.
                </li>
                <li>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                    2. Enter Certificate ID:
                  </span>{" "}
                  Type the unique ID printed on the certificate.
                </li>
                <li>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                    3. View details:
                  </span>{" "}
                  Confirm name, domain, dates, and issuing institution.
                </li>
                <li>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                    4. Download:
                  </span>{" "}
                  Save or print the verified certificate copy.
                </li>
              </ol>
            </div>
          </div>

          {/* Final CTA */}
          <div className="flex flex-col items-start justify-between gap-4 border-t border-dashed border-slate-200 pt-4 text-sm dark:border-slate-700 md:flex-row md:items-center">
            <p className="max-w-xl text-xs text-slate-600 dark:text-slate-300">
              Ready to modernize your internship certificate process? Start by
              creating an admin account and connecting your certificate data.
            </p>
            <Button
              asChild
              className="bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Link href="/signup">Start with Certivo</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
