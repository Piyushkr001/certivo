// app/contact/page.tsx
"use client";

import * as React from "react";
import axios from "axios";
import Link from "next/link";

import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  ShieldCheck,
  Building2,
  GraduationCap,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [userType, setUserType] = React.useState<
    "student" | "admin" | "recruiter" | "other"
  >("student");

  const [sending, setSending] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("Please fill in your name, email, and message.");
      return;
    }

    setSending(true);

    try {
      const res = await axios.post<{ message: string }>("/api/contact", {
        name,
        email,
        subject,
        message,
        type: userType,
      });

      setSuccessMessage(
        res.data?.message || "Thank you, your message has been sent."
      );
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setUserType("student");
    } catch (err: any) {
      console.error("Contact form error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while sending your message. Please try again.";
      setErrorMessage(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-3">
          <Badge className="w-fit bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
            Contact Certivo
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Let&apos;s make internship certificates{" "}
            <span className="text-blue-600">verifiable</span>.
          </h1>
          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
            Whether you are a Training &amp; Placement Officer, college
            admin, or student, reach out to us for onboarding, support, or
            integration queries.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Secure verification workflows
            </span>
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3 text-blue-500" />
              Colleges &amp; TPOs
            </span>
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="h-3 w-3 text-violet-500" />
              Students &amp; interns
            </span>
          </div>
        </div>

        {/* Quick contact info card */}
        <div className="mt-4 flex w-full max-w-md flex-1 flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/70">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-semibold">
              Quick contact
            </CardTitle>
            <CardDescription className="text-[11px]">
              Reach out to us over email or share your requirements, we will
              get back within 24–48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-0 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <a
                href="mailto:support@certivo.example"
                className="text-sm font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-50"
              >
                support@certivo.example
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-600" />
              <p className="text-sm text-slate-700 dark:text-slate-200">
                +91-XXXXXXXXXX
              </p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your institution / remote-first. We work closely with
                colleges, TPOs, and partner companies across India.
              </p>
            </div>
          </CardContent>
        </div>
      </section>

      {/* Main content: form + info */}
      <section className="flex flex-col gap-6 lg:flex-row">
        {/* Contact form */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Send us a message
            </CardTitle>
            <CardDescription className="text-xs">
              Share some details about who you are and how you&apos;d like
              to use Certivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 text-xs"
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={sending}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Onboarding, support, integration, etc."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={sending}
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Who are you?</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setUserType("student")}
                      className={`rounded-full border px-3 py-1 text-[11px] ${
                        userType === "student"
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200"
                          : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Student / Intern
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("admin")}
                      className={`rounded-full border px-3 py-1 text-[11px] ${
                        userType === "admin"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200"
                          : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Admin / TPO
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("recruiter")}
                      className={`rounded-full border px-3 py-1 text-[11px] ${
                        userType === "recruiter"
                          ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-950/40 dark:text-violet-200"
                          : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Recruiter
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("other")}
                      className={`rounded-full border px-3 py-1 text-[11px] ${
                        userType === "other"
                          ? "border-slate-900 bg-slate-900 text-slate-50 dark:border-slate-50 dark:bg-slate-50 dark:text-slate-900"
                          : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Other
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us about your use case, number of students, or any specific requirement you have."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  By submitting this form, you agree to be contacted over
                  email regarding Certivo onboarding or support.
                </p>
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send message
                    </>
                  )}
                </Button>
              </div>

              {errorMessage && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                  {errorMessage}
                </div>
              )}

              {successMessage && !errorMessage && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                  {successMessage}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Side info / FAQs */}
        <div className="flex w-full flex-col gap-4 lg:w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                How we typically respond
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Most onboarding and support queries are replied to within{" "}
                <span className="font-semibold">24–48 hours</span>, depending
                on volume and details shared.
              </p>
              <Separator />
              <ul className="space-y-1">
                <li>• Onboarding for colleges &amp; TPOs</li>
                <li>• Integration with existing portals</li>
                <li>• Support for certificate formats &amp; templates</li>
                <li>• Student access and login issues</li>
              </ul>
              <Separator />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                For urgent support during working hours, you can also reach
                out via the official email mentioned above.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Helpful links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Verify a certificate</span>
                <Link
                  href="/dashboard/verify"
                  className="text-[11px] font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                >
                  Open verify
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span>Admin / TPO login</span>
                <Link
                  href="/login?type=admin"
                  className="text-[11px] font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                >
                  Go to login
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span>Student login</span>
                <Link
                  href="/login?type=user"
                  className="text-[11px] font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                >
                  Go to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
