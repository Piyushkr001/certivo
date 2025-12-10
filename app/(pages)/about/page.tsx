// app/about/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyAuthJwt } from "@/lib/auth-jwt";

import {
  ShieldCheck,
  FileSearch,
  Users,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building2,
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
  title: "About | Certivo",
};

export default async function AboutPage() {
  // 🔑 Check if there is a valid logged-in user via JWT cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("certivo_token")?.value ?? null;

  let isLoggedIn = false;
  // Optional: you can also read the role if you need it elsewhere
  // let role: "admin" | "user" | null = null;

  if (token) {
    try {
      const payload = await verifyAuthJwt(token);
      if (payload && (payload as any).sub) {
        isLoggedIn = true;
        // role = (payload as any).role ?? null;
      }
    } catch {
      // Invalid/expired token → treat as logged out
      isLoggedIn = false;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 py-8 px-4 sm:px-6 lg:px-8">
      {/* HERO SECTION */}
      <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-4">
          <Badge className="w-fit bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
            Trusted Internship Certificates
          </Badge>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            About <span className="text-blue-600">Certivo</span>
          </h1>

          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
            Certivo is a DigiLocker-style verification system for internship
            certificates. Colleges, training &amp; placement cells, and
            partner companies can issue, manage, and verify digital
            certificates with a few clicks—while students get a single,
            secure place to prove their experience.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Always active: verify certificates */}
            <Button asChild className="gap-2">
              <Link href="/dashboard/verify">
                Verify a certificate
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            {/* Admin/TPO login – disabled when already logged in */}
            {isLoggedIn ? (
              <Button
                type="button"
                variant="outline"
                disabled
                className="cursor-not-allowed opacity-60"
              >
                Admin / TPO login
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/login?type=admin">Admin / TPO login</Link>
              </Button>
            )}
          </div>

          <div className="mt-4 grid gap-4 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                1-click
              </p>
              <p>Certificate verification via unique ID.</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Zero
              </p>
              <p>Manual PDF checking for recruiters.</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Central
              </p>
              <p>Dashboard for students, admins and TPOs.</p>
            </div>
          </div>
        </div>

        {/* Right-side highlight card */}
        <div className="flex w-full max-w-md flex-1 flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                DigiLocker-style verification
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Secure, tamper-evident certificate checks
              </p>
            </div>
          </div>

          <Separator className="my-1" />

          <p className="text-slate-600 dark:text-slate-300">
            Each certificate issued through Certivo is linked to a unique public
            ID. Anyone with this ID—recruiters, universities, or external
            partners—can verify its authenticity without logging in.
          </p>

          <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
            <li>• Public verification endpoint similar to DigiLocker</li>
            <li>• Role-based access for admins and students</li>
            <li>• Audit trail of verification checks and imports</li>
          </ul>
        </div>
      </section>

      {/* 3 PILLARS SECTION */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Built for students, institutions &amp; recruiters
        </h2>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Certivo sits between colleges, internship providers, and hiring
          teams—making it easy to issue, verify, and track internship
          certificates in one unified system.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                For Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Access all your internship certificates from a single dashboard,
                instead of searching email attachments and PDFs.
              </p>
              <ul className="space-y-1">
                <li>• View and download verified certificates</li>
                <li>• Share certificate IDs with recruiters</li>
                <li>• Track what has been verified and when</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-emerald-500" />
                For Colleges &amp; TPOs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Manage hundreds of internship records effortlessly with bulk
                Excel imports, organization mapping, and admin tools.
              </p>
              <ul className="space-y-1">
                <li>• Import certificates from Excel in one go</li>
                <li>• Link certificates to departments/organizations</li>
                <li>• Admin panel for approvals and audits</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-violet-500" />
                For Recruiters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Instead of manually verifying PDF certificates, recruiters can
                validate them with a single ID—just like DigiLocker documents.
              </p>
              <ul className="space-y-1">
                <li>• Instant authenticity check via public portal</li>
                <li>• Clear status: verified, pending, or rejected</li>
                <li>• Reduced manual follow-ups with candidates</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          How Certivo works
        </h2>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          The flow is simple: admins issue certificates, students receive them in
          their dashboards, and third parties verify them using a secure
          certificate ID.
        </p>

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Steps */}
          <div className="flex-1 space-y-3">
            <Card>
              <CardContent className="flex gap-3 py-4 text-xs">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                  1
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                    Admins create or import certificates
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Colleges or internship coordinators can either create single
                    certificates using a form or import full Excel sheets mapped
                    to specific organizations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex gap-3 py-4 text-xs">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/10 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                  2
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                    Students access certificates in their dashboard
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Each student gets a secure dashboard where they can view,
                    verify, and download internship certificates anytime.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex gap-3 py-4 text-xs">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600/10 text-xs font-semibold text-violet-600 dark:bg-violet-500/20 dark:text-violet-200">
                  3
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                    Recruiters verify using a unique certificate ID
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    The public verification page lets anyone validate a
                    certificate with just the ID—no login, no PDFs, and no
                    manual chasing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side card */}
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <FileSearch className="h-4 w-4 text-sky-500" />
                  Why we built Certivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  Internship verification is often messy—PDFs in email
                  attachments, manually signed certificates, and no easy way for
                  recruiters to know what is authentic. Certivo reduces that
                  friction by acting as a verification bridge between colleges,
                  students, and companies.
                </p>
                <p>
                  The system follows principles similar to DigiLocker:
                  centralized, verifiable records that can be checked
                  independently by any authorized party.
                </p>
                <div className="flex items-center gap-2 rounded-md bg-slate-50 p-2 text-[11px] dark:bg-slate-900/60">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span>
                    Designed to fit into existing college workflows while
                    preparing students for modern verification practices.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA / FOOTER STRIP */}
      <section className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-xs dark:border-slate-700 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Ready to streamline internship certificate verification?
          </p>
          <p className="max-w-xl text-[11px] text-slate-600 dark:text-slate-300">
            Log in to the admin or student dashboard and start issuing,
            managing, and verifying certificates with Certivo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Admin / TPO login – disabled when logged in */}
          {isLoggedIn ? (
            <>
              <Button
                type="button"
                size="sm"
                className="gap-1 cursor-not-allowed opacity-60"
                disabled
              >
                Admin / TPO login
                <ArrowRight className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="cursor-not-allowed opacity-60"
                disabled
              >
                Student login
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" className="gap-1">
                <Link href="/login?type=admin">
                  Admin / TPO login
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/login?type=user">Student login</Link>
              </Button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
