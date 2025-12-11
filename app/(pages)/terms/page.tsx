// app/terms/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Scale,
  CheckCircle2,
  Info,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-3">
          <Badge className="w-fit bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
            Legal • Terms of Service
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Terms of Service for{" "}
            <span className="text-blue-600">Certivo</span>
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Please read these Terms of Service carefully before using Certivo.
            By accessing or using the platform, you agree to be bound by these
            terms.
          </p>
        </div>

        {/* Quick meta card */}
        <div className="mt-2 flex w-full max-w-sm flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Summary snapshot
            </p>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            <li>• Certivo is a platform for issuing and verifying certificates.</li>
            <li>• Institutions are responsible for the accuracy of uploaded data.</li>
            <li>• Students control how they share their certificate IDs.</li>
            <li>• Misuse, fraud, or unauthorized access is strictly prohibited.</li>
          </ul>
          <Separator />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            This summary is for convenience only. Please review the full
            Terms of Service below for complete details.
          </p>
        </div>
      </section>

      {/* Main layout: flex with responsive columns */}
      <section className="flex flex-col gap-6 lg:flex-row">
        {/* Left column – key points */}
        <div className="flex w-full flex-col gap-4 lg:w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                What Certivo does
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Certivo helps colleges, TPOs, companies, and students to
                issue and verify internship certificates in a DigiLocker-style
                workflow.
              </p>
              <Separator className="my-2" />
              <ul className="space-y-1">
                <li>• Issue digital internship certificates</li>
                <li>• Verify certificates via unique Certificate ID</li>
                <li>• Maintain an audit trail of verification checks</li>
              </ul>
              <Separator className="my-2" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Certivo does not guarantee job offers, admissions, or
                third-party decisions based on certificates. Those remain with
                institutions, employers, and recruiters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-violet-500" />
                Document versions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Terms version</span>
                <span className="font-mono text-[11px]">
                  v1.0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last updated</span>
                <span className="text-[11px]">
                  2025-12-11
                </span>
              </div>
              <Separator className="my-2" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                We may update these terms over time. If you continue using the
                platform after updates, it means you accept the new terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-amber-500" />
                Not legal advice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                This Terms of Service page is provided as a general template for
                your project. You should review it with your institution or a
                legal professional before using it in production.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right column – main terms content */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Scale className="h-4 w-4 text-blue-600" />
              Full Terms of Service
            </CardTitle>
            <CardDescription className="text-xs">
              This section describes the rules that govern your use of
              Certivo as a student, admin, TPO, or organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {/* Scrollable content for long legal text */}
            <ScrollArea className="h-[540px] pr-3">
              <div className="space-y-6 text-xs text-slate-700 dark:text-slate-200">
                {/* 1. Acceptance of terms */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    1. Acceptance of Terms
                  </h2>
                  <p>
                    By accessing or using Certivo (the &quot;Platform&quot;),
                    including any dashboards, admin panels, verification
                    pages, or APIs, you agree to be bound by these Terms of
                    Service (&quot;Terms&quot;). If you do not agree with
                    these Terms, you must not use the Platform.
                  </p>
                </section>

                {/* 2. Users and roles */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    2. User Roles and Eligibility
                  </h2>
                  <p>
                    Certivo may be used by different categories of users,
                    including:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <span className="font-medium">Students/Interns:</span>{" "}
                      individuals who receive certificates and verify them.
                    </li>
                    <li>
                      <span className="font-medium">Admins / TPOs:</span>{" "}
                      institutional staff who onboard organizations and issue
                      certificates.
                    </li>
                    <li>
                      <span className="font-medium">
                        Partner organizations:
                      </span>{" "}
                      companies or departments that verify certificates through
                      the Platform.
                    </li>
                  </ul>
                  <p>
                    You represent that you are authorized to use Certivo on
                    behalf of your institution or yourself, and that you will
                    follow all applicable laws and institutional policies.
                  </p>
                </section>

                {/* 3. Platform purpose */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    3. Platform Purpose
                  </h2>
                  <p>
                    Certivo provides a digital workflow to issue, manage, and
                    verify internship certificates. The Platform acts as a
                    system of record and verification tool, similar in spirit
                    to DigiLocker-style verification for documents.
                  </p>
                  <p>
                    Certivo does <span className="font-semibold">not</span>{" "}
                    guarantee:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Job offers or placements.</li>
                    <li>Admissions or academic decisions.</li>
                    <li>Third-party outcomes based on certificate data.</li>
                  </ul>
                </section>

                {/* 4. Institutional responsibilities */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    4. Institutional Responsibilities
                  </h2>
                  <p>
                    If you are an admin, TPO, or organization user, you are
                    responsible for:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      Ensuring that all certificate data (names, programs,
                      durations, organization names) is accurate.
                    </li>
                    <li>
                      Issuing certificates only to legitimate students or
                      interns who have completed the required work.
                    </li>
                    <li>
                      Keeping admin credentials secure and limited to
                      authorized staff.
                    </li>
                  </ul>
                  <p>
                    Certivo is not liable for inaccurate data uploaded by
                    institutions or admins.
                  </p>
                </section>

                {/* 5. Student / user responsibilities */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    5. Student / User Responsibilities
                  </h2>
                  <p>As a student or certificate holder, you agree to:</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      Keep your login credentials confidential and not share
                      them with others.
                    </li>
                    <li>
                      Use your Certificate ID only for legitimate verification
                      purposes.
                    </li>
                    <li>
                      Not misrepresent or tamper with certificates or
                      verification results.
                    </li>
                  </ul>
                </section>

                {/* 6. Prohibited use */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    6. Prohibited Use
                  </h2>
                  <p>You agree not to:</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      Attempt to gain unauthorized access to admin panels,
                      dashboards, or other users&apos; accounts.
                    </li>
                    <li>
                      Reverse engineer, modify, or interfere with security
                      mechanisms (JWT, role-based access, etc.).
                    </li>
                    <li>
                      Upload malicious files or scripts through Excel import
                      or other features.
                    </li>
                    <li>
                      Use Certivo for fraudulent, illegal, or misleading
                      activities.
                    </li>
                  </ul>
                </section>

                {/* 7. Verification and audit logs */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    7. Verification Checks and Activity Logs
                  </h2>
                  <p>
                    Certivo may record verification checks (lookups) of
                    certificate IDs for audit and security purposes. These
                    logs may include timestamps, certificate codes, and basic
                    metadata required to maintain a traceable history.
                  </p>
                  <p>
                    Institutions may use these logs for internal reporting,
                    fraud detection, and audit requirements.
                  </p>
                </section>

                {/* 8. Availability and changes */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    8. Availability, Maintenance, and Changes
                  </h2>
                  <p>
                    We aim to keep Certivo secure and available, but we do
                    not guarantee uninterrupted or error-free operation. We
                    may temporarily suspend access for maintenance, upgrades,
                    or security reasons.
                  </p>
                  <p>
                    Features such as Excel import, verification portal, or
                    certificate templates may change or be updated over time.
                  </p>
                </section>

                {/* 9. Data and privacy */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    9. Data and Privacy
                  </h2>
                  <p>
                    Certivo handles personal and academic information such as
                    student names, email addresses, and certificate details.
                    This data is used to issue and verify certificates and to
                    protect against fraud.
                  </p>
                  <p>
                    A separate Privacy Policy may describe how data is stored,
                    processed, and retained. In the absence of a formal policy,
                    you should treat this project as a prototype and avoid
                    storing sensitive data in production environments.
                  </p>
                </section>

                {/* 10. Limitation of liability */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    10. Limitation of Liability
                  </h2>
                  <p>
                    To the maximum extent permitted by law, Certivo (and its
                    developers, contributors, or hosting providers) shall not
                    be liable for any indirect, incidental, or consequential
                    damages arising from your use of the Platform, including
                    but not limited to:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Lost opportunities or placements.</li>
                    <li>Decisions made by third parties based on certificates.</li>
                    <li>Data loss, downtime, or unauthorized access.</li>
                  </ul>
                </section>

                {/* 11. Termination */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    11. Suspension and Termination
                  </h2>
                  <p>
                    We may suspend or terminate access to Certivo for any user
                    who:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Violates these Terms.</li>
                    <li>Attempts to compromise security or integrity.</li>
                    <li>
                      Uses the Platform for fraud, impersonation, or misuse.
                    </li>
                  </ul>
                  <p>
                    Institutions may also deactivate student accounts as part
                    of their internal policies.
                  </p>
                </section>

                {/* 12. Changes to terms */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    12. Changes to These Terms
                  </h2>
                  <p>
                    We may update these Terms from time to time. When we do,
                    we will update the &quot;Last updated&quot; date at the
                    top of this page. Continued use of Certivo after such
                    changes means you accept the updated Terms.
                  </p>
                </section>

                {/* 13. Contact */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    13. Contact and Support
                  </h2>
                  <p>
                    For questions about these Terms or to report misuse of
                    Certivo, please contact us via the{" "}
                    <Link
                      href="/contact"
                      className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                    >
                      Contact
                    </Link>{" "}
                    page or by email at{" "}
                    <span className="font-mono">
                      support@certivo.example
                    </span>
                    .
                  </p>
                </section>

                <Separator className="my-4" />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>Prototype / demo terms only</span>
                  </div>
                  <div>Last updated: 2025-12-11</div>
                </div>
              </div>
            </ScrollArea>

            {/* Bottom actions */}
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 text-[11px] dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-500 dark:text-slate-400">
                This page is intended as a starting point. For real
                production use, please review and adapt it with legal
                support.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/privacy">View Privacy Policy (optional)</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/contact">Contact for clarifications</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
