// app/services/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyAuthJwt } from "@/lib/auth-jwt";

import {
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  ScanSearch,
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  Globe2,
  Link2,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Services | Certivo",
};

export default async function ServicesPage() {
  // 🔑 Check if user is already logged in via JWT cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("certivo_token")?.value ?? null;

  let isLoggedIn = false;
  let role: "admin" | "user" | undefined;

  if (token) {
    try {
      const payload = await verifyAuthJwt(token);
      if (payload && (payload as any).sub) {
        isLoggedIn = true;
        role = (payload as any).role as "admin" | "user" | undefined;
      }
    } catch {
      isLoggedIn = false;
      role = undefined;
    }
  }

  const isAdmin = role === "admin";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 py-8 px-4 sm:px-6 lg:px-8">
      {/* HERO SECTION */}
      <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-4">
          <Badge className="w-fit bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
            Certivo Services
          </Badge>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Services that power{" "}
            <span className="text-blue-600">internship certificate</span>{" "}
            verification.
          </h1>

          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
            Certivo brings together certificate issuance, verification, and
            dashboards into one platform. From bulk Excel imports to
            DigiLocker-style public verification, our services are designed
            for colleges, TPOs, and students.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link href="/dashboard/verify">
                Try certificate verification
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            {isLoggedIn ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="cursor-not-allowed opacity-60"
                >
                  Admin / TPO login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="cursor-not-allowed opacity-60"
                >
                  Student login
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login?type=admin">Admin / TPO login</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login?type=user">Student login</Link>
                </Button>
              </>
            )}
          </div>

          <div className="mt-4 grid gap-4 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Bulk
              </p>
              <p>Issue certificates via Excel imports.</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Real-time
              </p>
              <p>Instant public verification by ID.</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Central
              </p>
              <p>Dashboards for admins and students.</p>
            </div>
          </div>
        </div>

        {/* Side “service bundle” card */}
        <div className="flex w-full max-w-md flex-1 flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Integrated services
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                From issuance to verification, end-to-end.
              </p>
            </div>
          </div>

          <Separator className="my-1" />

          <p className="text-slate-600 dark:text-slate-300">
            Certivo combines admin tools, student dashboards, and a public
            verification portal—so you do not need separate systems for
            certificates, storage, and verification.
          </p>

          <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
            <li>• Excel-based import &amp; admin issuance tools</li>
            <li>• Student dashboard for secure access</li>
            <li>• Public verification endpoint via unique ID</li>
          </ul>
        </div>
      </section>

      {/* CORE SERVICES GRID */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Core services offered by Certivo
        </h2>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Each service is designed to solve a specific pain point in the
          internship certificate lifecycle: creation, distribution, and
          verification.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Admin certificate issuance */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                Certificate issuance (admin)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Create certificates manually or in bulk via Excel imports,
                linked to organizations and admins for a clear audit trail.
              </p>
              <ul className="space-y-1">
                <li>• Excel import for large batches</li>
                <li>• Manual issuance form for single records</li>
                <li>• Automatic code generation for each certificate</li>
              </ul>
            </CardContent>
          </Card>

          {/* Public verification portal */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <ScanSearch className="h-4 w-4 text-blue-500" />
                Public verification portal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                A DigiLocker-style verification page where any recruiter or
                institution can validate a certificate using just its ID.
              </p>
              <ul className="space-y-1">
                <li>• Public /verify endpoint</li>
                <li>• Shows holder, program, status &amp; dates</li>
                <li>• Optional PDF view &amp; download</li>
              </ul>
            </CardContent>
          </Card>

          {/* Student dashboard */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <LayoutDashboard className="h-4 w-4 text-violet-500" />
                Student dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Students log in to a dedicated dashboard where all their
                internship certificates are organized and easy to share.
              </p>
              <ul className="space-y-1">
                <li>• View and download certificates</li>
                <li>• Keep track of verification status</li>
                <li>• One place to store internship records</li>
              </ul>
            </CardContent>
          </Card>

          {/* Organization & TPO management */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                Organization &amp; TPO mapping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Manage colleges, TPOs, and partner companies as “organizations”
                that can be attached to each certificate.
              </p>
              <ul className="space-y-1">
                <li>• Maintain a registry of organizations</li>
                <li>• Link certificates to specific institutes or cells</li>
                <li>• Use organization names in public verification</li>
              </ul>
            </CardContent>
          </Card>

          {/* Audit trail & activity logs */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-amber-500" />
                Audit trail &amp; activity log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Every important action—imports, manual issuance, and public
                lookups—is recorded as an activity entry.
              </p>
              <ul className="space-y-1">
                <li>• Track who issued which certificate</li>
                <li>• View when a certificate was checked</li>
                <li>• Improve transparency and trust</li>
              </ul>
            </CardContent>
          </Card>

          {/* Configuration & integrations */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Globe2 className="h-4 w-4 text-teal-500" />
                Configuration &amp; integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Admins can configure verification rules and public portal
                behavior to match institutional policies.
              </p>
              <ul className="space-y-1">
                <li>• Control public portal visibility &amp; downloads</li>
                <li>• Set defaults for import verification status</li>
                <li>• Align with DigiLocker-style verification flows</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Who benefits from these services?
        </h2>
        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                For students &amp; interns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Students receive authenticated, centrally stored internship
                certificates that are easy to share with recruiters.
              </p>
              <ul className="space-y-1">
                <li>• Single source of truth for internships</li>
                <li>• Verifiable IDs instead of just PDFs</li>
                <li>• Better presentation in placements &amp; job search</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-emerald-500" />
                For colleges, TPOs &amp; departments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Reduce manual certificate generation, maintain clean records,
                and give stakeholders a professional verification experience.
              </p>
              <ul className="space-y-1">
                <li>• Bulk issuance instead of manual drafts</li>
                <li>• Clear separation of roles &amp; access</li>
                <li>• Better compliance and record keeping</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-violet-500" />
                For recruiters &amp; partner companies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Recruiters can independently verify that an internship was
                actually completed and issued by a trusted institution.
              </p>
              <ul className="space-y-1">
                <li>• Quick authenticity check via public portal</li>
                <li>• Fewer emails asking for confirmation</li>
                <li>• Stronger trust in student experience</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-xs dark:border-slate-700 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Start using Certivo services in your institution.
          </p>
          <p className="max-w-xl text-[11px] text-slate-600 dark:text-slate-300">
            Connect your training &amp; placement cell, map your organizations,
            and begin issuing verifiable internship certificates in days—not
            months.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* ⬇️ Only show this button if the logged-in user is an admin */}
          {isAdmin && (
            <Button asChild size="sm" className="gap-1">
              <Link href="/admin/organizations">
                Onboard organizations
                <Link2 className="h-3 w-3" />
              </Link>
            </Button>
          )}

          {isLoggedIn ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled
              className="cursor-not-allowed opacity-60"
            >
              Admin / Student login
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/login?type=admin">
                Admin / TPO &amp; Student login
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
