// app/privacy/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Mail,
  Database,
  Globe2,
  Cookie,
  AlertTriangle,
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

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-3">
          <Badge className="w-fit bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
            Legal • Privacy Policy
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy Policy for{" "}
            <span className="text-blue-600">Certivo</span>
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            This Privacy Policy explains how Certivo collects, uses, and
            protects personal data related to issuing and verifying digital
            internship certificates.
          </p>
        </div>

        {/* Quick meta card */}
        <div className="mt-2 flex w-full max-w-sm flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Data snapshot
            </p>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            <li>• We store basic identity and certificate details.</li>
            <li>• Data is used for issuing and verifying certificates.</li>
            <li>• We do not sell your personal data.</li>
            <li>• You can contact us to update or deactivate your account.</li>
          </ul>
          <Separator />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            This is a project-oriented template. Review and adapt it before
            using in production or for real institutions.
          </p>
        </div>
      </section>

      {/* Main layout: flex with responsive columns */}
      <section className="flex flex-col gap-6 lg:flex-row">
        {/* Left column – key info cards */}
        <div className="flex w-full flex-col gap-4 lg:w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Shield className="h-4 w-4 text-emerald-500" />
                What we protect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Certivo is designed to protect the authenticity of
                internship certificates while handling your personal data
                responsibly.
              </p>
              <Separator className="my-2" />
              <ul className="space-y-1">
                <li>• Identity details (name, email, enrollment)</li>
                <li>• Internship and certificate metadata</li>
                <li>• Verification and activity logs</li>
              </ul>
              <Separator className="my-2" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Access to admin features is restricted by JWT-based
                authentication and role-based permissions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Database className="h-4 w-4 text-violet-500" />
                Policy metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Policy version</span>
                <span className="font-mono text-[11px]">v1.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last updated</span>
                <span className="text-[11px]">2025-12-11</span>
              </div>
              <Separator className="my-2" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                We may revise this policy over time. You should periodically
                review this page to stay informed about changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Important notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                This Privacy Policy is provided as a template for your
                internship certificate platform. It does not replace
                institution-specific legal or regulatory requirements.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right column – full privacy policy */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Globe2 className="h-4 w-4 text-blue-600" />
              Full Privacy Policy
            </CardTitle>
            <CardDescription className="text-xs">
              This section explains what data Certivo collects, why we
              collect it, and how it is stored, used, and protected.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {/* Scrollable content */}
            <ScrollArea className="h-[540px] pr-3">
              <div className="space-y-6 text-xs text-slate-700 dark:text-slate-200">
                {/* 1. Introduction */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    1. Introduction
                  </h2>
                  <p>
                    Certivo (&quot;we&quot;, &quot;our&quot;, or
                    &quot;us&quot;) provides a digital platform to issue and
                    verify internship certificates. This Privacy Policy
                    describes how we handle personal data when students,
                    admins, TPOs, organizations, or recruiters use the
                    Platform.
                  </p>
                </section>

                {/* 2. Data we collect */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    2. Data We Collect
                  </h2>
                  <p>
                    Depending on your role and how you use Certivo, we may
                    collect the following categories of data:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <span className="font-medium">
                        Identity information:
                      </span>{" "}
                      name, email address, enrollment or student ID (if
                      provided by your institution).
                    </li>
                    <li>
                      <span className="font-medium">
                        Certificate information:
                      </span>{" "}
                      certificate code/ID, program or domain, duration,
                      organization name, and issue dates.
                    </li>
                    <li>
                      <span className="font-medium">
                        Account and access data:
                      </span>{" "}
                      login credentials (hashed passwords), role
                      (&quot;admin&quot;, &quot;user&quot;), and account
                      status.
                    </li>
                    <li>
                      <span className="font-medium">
                        Technical and usage data:
                      </span>{" "}
                      IP address (in logs), timestamps, pages visited,
                      verification lookups, and actions performed on the
                      dashboard.
                    </li>
                  </ul>
                </section>

                {/* 3. How we use your data */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    3. How We Use Your Data
                  </h2>
                  <p>We use personal data for the following purposes:</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      To create and manage user accounts (students, admins,
                      TPOs).
                    </li>
                    <li>
                      To issue, store, and display digital internship
                      certificates.
                    </li>
                    <li>
                      To verify certificates when a valid Certificate ID is
                      entered in the verification portal.
                    </li>
                    <li>
                      To maintain audit logs of verification checks for
                      security and reporting.
                    </li>
                    <li>
                      To send essential notifications, such as security
                      alerts or important updates about the Platform.
                    </li>
                  </ul>
                </section>

                {/* 4. Cookies and similar technologies */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    4. Cookies and Session Storage
                  </h2>
                  <p>
                    Certivo uses a combination of HTTP-only cookies and
                    optional in-browser storage to keep you signed in and
                    secure.
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <span className="font-medium">Authentication:</span>{" "}
                      an HttpOnly cookie (such as{" "}
                      <span className="font-mono">certivo_token</span>) may
                      store a JWT that proves your identity.
                    </li>
                    <li>
                      <span className="font-medium">Preferences:</span> we
                      may store basic preferences like notification settings
                      or UI options.
                    </li>
                  </ul>
                  <p>
                    We do not use cookies for behavioral advertising or
                    cross-site tracking in this project template.
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <Cookie className="h-3 w-3" />
                    <span>Cookies are used primarily for secure login.</span>
                  </div>
                </section>

                {/* 5. Legal basis (if needed) */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    5. Legal Basis (for educational / demo context)
                  </h2>
                  <p>
                    In a real institutional deployment, the legal basis for
                    processing your data may include:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      Performance of a contract (e.g., internship or
                      training program).
                    </li>
                    <li>
                      Legitimate interest of your institution in verifying
                      and certifying internship activities.
                    </li>
                    <li>
                      Compliance with academic or regulatory requirements.
                    </li>
                  </ul>
                  <p>
                    For this project version, data handling is illustrative
                    and should not be used in production without proper
                    legal review.
                  </p>
                </section>

                {/* 6. Data sharing */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    6. Data Sharing and Disclosure
                  </h2>
                  <p>
                    We generally do not share your personal data with third
                    parties except in the following circumstances:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>
                      <span className="font-medium">
                        With your institution:
                      </span>{" "}
                      admins and TPOs from your college or organization may
                      access your certificates and related logs as part of
                      their duties.
                    </li>
                    <li>
                      <span className="font-medium">
                        With verification requesters:
                      </span>{" "}
                      when someone enters a valid Certificate ID, we display
                      limited certificate details to confirm authenticity.
                    </li>
                    <li>
                      <span className="font-medium">
                        With service providers:
                      </span>{" "}
                      infrastructure providers (e.g., hosting, database)
                      that help run the Platform.
                    </li>
                    <li>
                      When required by law, court order, or to protect the
                      security and integrity of the Platform.
                    </li>
                  </ul>
                  <p>
                    We do <span className="font-semibold">not</span> sell
                    personal data for marketing purposes.
                  </p>
                </section>

                {/* 7. Data retention */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    7. Data Retention
                  </h2>
                  <p>
                    Certificates and related logs may be retained for as long
                    as they are needed by your institution for academic,
                    audit, or compliance purposes.
                  </p>
                  <p>
                    For project or demo environments, data may be reset or
                    deleted as part of development and testing (e.g. via
                    &quot;Clear test data&quot; actions in the admin panel).
                  </p>
                </section>

                {/* 8. Security */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    8. Security Measures
                  </h2>
                  <p>
                    Certivo uses several measures to protect your data, such
                    as:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>JWT-based authentication and role-based access.</li>
                    <li>HttpOnly cookies to reduce risk of token theft.</li>
                    <li>Audit logs for certificate lookups and admin activity.</li>
                  </ul>
                  <p>
                    No system can guarantee absolute security. You are
                    responsible for keeping your password confidential and
                    using trusted devices only.
                  </p>
                </section>

                {/* 9. Your rights */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    9. Your Rights and Choices
                  </h2>
                  <p>
                    Depending on your institution&apos;s policies and local
                    regulations, you may have rights such as:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Requesting access to your stored certificate data.</li>
                    <li>Requesting corrections to inaccurate information.</li>
                    <li>
                      Requesting deactivation of your user account (handled by
                      your institution or admin).
                    </li>
                  </ul>
                  <p>
                    To exercise these rights, please contact your institution
                    or use the{" "}
                    <Link
                      href="/contact"
                      className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                    >
                      Contact
                    </Link>{" "}
                    page on Certivo.
                  </p>
                </section>

                {/* 10. Children / minors */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    10. Children and Minors
                  </h2>
                  <p>
                    Certivo is typically used by higher-education students or
                    trainees. If it is used for minors, the institution is
                    responsible for obtaining any required consents and
                    complying with applicable child data protection rules.
                  </p>
                </section>

                {/* 11. Changes to this policy */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    11. Changes to This Privacy Policy
                  </h2>
                  <p>
                    We may update this Privacy Policy to reflect changes in
                    how Certivo handles data. When we do, we will update the
                    &quot;Last updated&quot; date at the top of this page.
                    Continued use of Certivo after such updates indicates
                    your acceptance of the revised policy.
                  </p>
                </section>

                {/* 12. Contact */}
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    12. Contact Us
                  </h2>
                  <p>
                    If you have questions about this Privacy Policy or how
                    your data is handled, please reach out via the{" "}
                    <Link
                      href="/contact"
                      className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                    >
                      Contact
                    </Link>{" "}
                    page or email{" "}
                    <span className="font-mono">
                      privacy@certivo.example
                    </span>
                    .
                  </p>
                </section>

                <Separator className="my-4" />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    This is a prototype-oriented privacy policy template.
                  </span>
                  <span>Last updated: 2025-12-11</span>
                </div>
              </div>
            </ScrollArea>

            {/* Bottom actions */}
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 text-[11px] dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-500 dark:text-slate-400">
                For real institutional use, have this policy reviewed by a
                legal or compliance team before deployment.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/terms">View Terms of Service</Link>
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
