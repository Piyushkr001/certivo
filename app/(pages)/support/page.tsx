// app/support/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";

import {
  LifeBuoy,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  BookOpen,
  Clock,
  AlertCircle,
  Lock,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

export default function SupportPage() {
  const [subject, setSubject] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    if (!subject.trim() || !description.trim()) {
      setStatusMessage(
        "Please fill in the subject and a short description before submitting."
      );
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          category,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Failed to submit support request. Please try again."
        );
      }

      setStatusMessage(
        data?.message ||
          "Your support request has been sent to the support team."
      );

      setSubject("");
      setCategory("");
      setDescription("");
    } catch (err: any) {
      console.error("Support submit error:", err);
      setStatusMessage(
        err?.message ||
          "Failed to submit support request. Please try again later or use the email contact."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-3">
          <Badge className="w-fit bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
            Support • Help Center
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How can we help you with{" "}
            <span className="text-blue-600">Certivo</span>?
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Find answers to common questions, get help with certificate
            verification, and contact our support team for issues related to
            your internship certificates and dashboard access.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Typical response time: 24–48 hours (demo text)
            </span>
          </div>
        </div>

        {/* Quick contact card */}
        <div className="mt-2 flex w-full max-w-sm flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Need urgent help?
            </p>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            For critical issues such as certificate mismatch, wrong name, or
            access problems, contact your institution&apos;s TPO/admin first.
          </p>
          <Separator />
          <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-blue-600" />
              <span>support@certivo.example</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-blue-600" />
              <span>+91-00000-00000 (demo)</span>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="mt-1 w-full justify-center gap-1 text-xs"
          >
            <Link href="/contact">
              <MessageCircle className="h-3 w-3" />
              Go to Contact page
            </Link>
          </Button>
        </div>
      </section>

      {/* Main layout */}
      <section className="flex flex-col gap-6 lg:flex-row">
        {/* Left column – support request form */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              Submit a support request
            </CardTitle>
            <CardDescription className="text-xs">
              Use this form for non-urgent issues such as dashboard errors,
              certificate visibility, or verification questions. We will route
              your message to the support inbox configured by your admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 text-xs"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="subject"
                  className="text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  Subject
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Certificate not visible on my dashboard"
                  className="text-sm"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCategory("verification")}
                      className={`flex items-center justify-center rounded-md border px-2 py-2 transition ${
                        category === "verification"
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-200"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      Verification
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory("certificate")}
                      className={`flex items-center justify-center rounded-md border px-2 py-2 transition ${
                        category === "certificate"
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-200"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      Certificate issue
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory("login")}
                      className={`flex items-center justify-center rounded-md border px-2 py-2 transition ${
                        category === "login"
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-200"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      Login / account
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory("other")}
                      className={`flex items-center justify-center rounded-md border px-2 py-2 transition ${
                        category === "other"
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-200"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      Other
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Choosing a category helps admins route your issue
                    correctly.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="description"
                  className="text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Explain what went wrong, include any Certificate ID (CERT-INT-...) or screenshots if relevant."
                  className="text-xs"
                  disabled={submitting}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  For certificate issues, include your full name, email, and
                  the certificate code printed on your document.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  This form sends your request to the support inbox configured
                  by your admin (via <code className="font-mono text-[10px]">/api/support</code>).
                </p>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit support request"}
                </Button>
              </div>

              {statusMessage && (
                <div className="mt-1 flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                  <AlertCircle className="mt-0.5 h-3 w-3 text-blue-500" />
                  <p>{statusMessage}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Right column – FAQs and guidance */}
        <div className="flex w-full flex-col gap-4 lg:w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                Quick help guides
              </CardTitle>
              <CardDescription className="text-xs">
                Common questions from students and admins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-700 dark:text-slate-200">
              <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="student" className="text-xs">
                    For students
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="text-xs">
                    For admins/TPO
                  </TabsTrigger>
                </TabsList>

                {/* Student tab */}
                <TabsContent value="student" className="mt-3 space-y-3">
                  <div>
                    <p className="font-medium">My certificate is not found</p>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      Make sure you are entering the exact Certificate ID
                      (e.g. <span className="font-mono">CERT-INT-2025-000123</span>{" "}
                      in uppercase, without spaces). If the problem continues,
                      contact your college TPO or submit a request here.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">
                      I can&apos;t see my certificate on the dashboard
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      Sometimes your admin may have issued the certificate but
                      not yet verified it. Check with your TPO or raise a support
                      ticket including your name, email, and ID.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">My name is spelled incorrectly</p>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      Name changes can only be made by your institution&apos;s
                      admin. Submit a request here and also email your official
                      college contact if necessary.
                    </p>
                  </div>
                </TabsContent>

                {/* Admin tab */}
                <TabsContent value="admin" className="mt-3 space-y-3">
                  <div>
                    <p className="font-medium">
                      Excel import completed, but some rows failed
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      Check the error summary on the Certificates admin page. If
                      emails are missing or invalid, fix them in the sheet and
                      re-import only those rows.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">
                      Public verification not showing organization name
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      Confirm that each certificate has{" "}
                      <span className="font-mono">organizationName</span> set and
                      that the public portal settings allow showing organization
                      details.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">
                      Students can&apos;t log in or see dashboards
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      Verify that user accounts are active in the admin
                      dashboard and that the correct role (&quot;user&quot;) is
                      assigned. You can also test login with a dummy student
                      account.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Links to other resources */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Helpful links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-700 dark:text-slate-200">
              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                >
                  <Link href="/dashboard/verify">
                    <HelpCircle className="h-3 w-3" />
                    Verify a certificate (logged-in view)
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                >
                  <Link href="/contact">
                    <Mail className="h-3 w-3" />
                    Contact / feedback form
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                >
                  <Link href="/terms">
                    <BookOpen className="h-3 w-3" />
                    Terms of Service
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                >
                  <Link href="/privacy">
                    <Lock className="h-3 w-3" />
                    Privacy Policy
                  </Link>
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                If you are unsure which option to choose, just submit a support
                request above with as much detail as possible.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
