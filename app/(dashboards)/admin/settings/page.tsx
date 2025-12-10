// app/admin/settings/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/app/auth/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import {
  ShieldCheck,
  Settings as SettingsIcon,
  CheckCircle2,
  Globe2,
  Bell,
  FileBadge2,
  DatabaseZap,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Verification defaults
  const [autoVerifyImports, setAutoVerifyImports] = React.useState(true);
  const [requireReviewForManual, setRequireReviewForManual] =
    React.useState(false);
  const [lockStatusAfterDownload, setLockStatusAfterDownload] =
    React.useState(false);
  const [savingVerification, setSavingVerification] =
    React.useState(false);
  const [verificationMessage, setVerificationMessage] =
    React.useState<string | null>(null);

  // Public portal settings
  const [publicLookupEnabled, setPublicLookupEnabled] =
    React.useState(true);
  const [showOrgNameOnPublic, setShowOrgNameOnPublic] =
    React.useState(true);
  const [allowPublicPdfDownload, setAllowPublicPdfDownload] =
    React.useState(true);
  const [savingPortal, setSavingPortal] = React.useState(false);
  const [portalMessage, setPortalMessage] =
    React.useState<string | null>(null);

  // System actions
  const [runningMaintenance, setRunningMaintenance] =
    React.useState(false);

  const roleLabel =
    user?.role === "admin" ? "Administrator" : "Admin Panel";

  // ⬇️ Load settings from backend on mount
  React.useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        // Load verification + public portal settings in parallel
        const [verRes, portalRes] = await Promise.all([
          axios.get("/api/admin/settings/verification"),
          axios.get("/api/admin/settings/public-portal"),
        ]);

        if (cancelled) return;

        // Verification settings
        setAutoVerifyImports(
          Boolean(verRes.data?.autoVerifyImports ?? true)
        );
        setRequireReviewForManual(
          Boolean(verRes.data?.requireReviewForManual ?? false)
        );
        setLockStatusAfterDownload(
          Boolean(verRes.data?.lockStatusAfterDownload ?? false)
        );

        // Public portal
        setPublicLookupEnabled(
          Boolean(portalRes.data?.publicLookupEnabled ?? true)
        );
        setShowOrgNameOnPublic(
          Boolean(portalRes.data?.showOrgNameOnPublic ?? true)
        );
        setAllowPublicPdfDownload(
          Boolean(portalRes.data?.allowPublicPdfDownload ?? true)
        );
      } catch (err) {
        console.error("Failed to load admin settings:", err);
        // Keep safe defaults, just log error
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Save verification defaults → /api/admin/settings/verification
  async function handleSaveVerificationDefaults() {
    setSavingVerification(true);
    setVerificationMessage(null);

    try {
      const res = await axios.post("/api/admin/settings/verification", {
        autoVerifyImports,
        requireReviewForManual,
        lockStatusAfterDownload,
      });

      setVerificationMessage(
        res.data?.message || "Verification defaults updated."
      );
    } catch (err: any) {
      console.error("Save verification settings error:", err);
      setVerificationMessage(
        err?.response?.data?.message ||
          "Failed to save verification settings."
      );
    } finally {
      setSavingVerification(false);
    }
  }

  // ✅ Save public portal settings → /api/admin/settings/public-portal
  async function handleSavePortalSettings() {
    setSavingPortal(true);
    setPortalMessage(null);

    try {
      const res = await axios.post(
        "/api/admin/settings/public-portal",
        {
          publicLookupEnabled,
          showOrgNameOnPublic,
          allowPublicPdfDownload,
        }
      );

      setPortalMessage(
        res.data?.message || "Public portal settings updated."
      );
    } catch (err: any) {
      console.error("Save public portal settings error:", err);
      setPortalMessage(
        err?.response?.data?.message ||
          "Failed to save public portal settings."
      );
    } finally {
      setSavingPortal(false);
    }
  }

  // 👉 Still UI-only; wire later if you add real APIs
  async function handleRebuildSearchIndex() {
    const confirmed = window.confirm(
      "Rebuild search index for certificates? This may take a few minutes on production."
    );
    if (!confirmed) return;

    setRunningMaintenance(true);
    try {
      // TODO: call /api/admin/system/rebuild-index
      await new Promise((r) => setTimeout(r, 800));
      alert("Search index rebuild triggered (demo only).");
    } finally {
      setRunningMaintenance(false);
    }
  }

  async function handleClearTestData() {
    const confirmed = window.confirm(
      "This is intended for sandbox/test environments only.\n\nClear imported test data (certificates & activities)?"
    );
    if (!confirmed) return;

    setRunningMaintenance(true);
    try {
      // TODO: call /api/admin/system/clear-test-data
      await new Promise((r) => setTimeout(r, 800));
      alert("Test data reset triggered (demo only).");
    } finally {
      setRunningMaintenance(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 hidden rounded-md bg-slate-900/90 p-2 text-slate-50 dark:bg-slate-100 dark:text-slate-900 sm:block">
            <SettingsIcon className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Admin Settings
            </h1>
            <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Configure how certificates are verified, how the public
              portal behaves, and manage system-level maintenance for
              Certivo.
            </p>
          </div>
        </div>

        {user && (
          <Badge className="w-fit justify-center gap-1 bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
            <ShieldCheck className="h-3 w-3" />
            {roleLabel}
          </Badge>
        )}
      </div>

      {/* Main layout: responsive flex columns */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left column: settings forms */}
        <div className="flex-1 space-y-4">
          {/* Verification defaults */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Verification defaults
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Control how certificates are marked as verified when they
                are created manually or imported from Excel. These rules
                apply to all organizations managed in this admin panel.
              </p>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      Auto-verify Excel imports
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Certificates imported from the Excel tool are
                      immediately marked as{" "}
                      <span className="font-semibold">verified</span>.
                    </p>
                  </div>
                  <Switch
                    checked={autoVerifyImports}
                    onCheckedChange={setAutoVerifyImports}
                    disabled={savingVerification}
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      Require review for manual entries
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      New certificates created via the form start as{" "}
                      <span className="font-semibold">pending</span> and
                      must be approved by an admin.
                    </p>
                  </div>
                  <Switch
                    checked={requireReviewForManual}
                    onCheckedChange={setRequireReviewForManual}
                    disabled={savingVerification}
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      Lock status after public download
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Once a certificate PDF has been downloaded from the
                      public portal, its status cannot be changed without a
                      traceable admin reason.
                    </p>
                  </div>
                  <Switch
                    checked={lockStatusAfterDownload}
                    onCheckedChange={setLockStatusAfterDownload}
                    disabled={savingVerification}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  These settings affect how{" "}
                  <span className="font-semibold">all</span> certificates
                  behave in verification workflows.
                </p>
                <Button
                  type="button"
                  size="sm"
                  disabled={savingVerification}
                  onClick={handleSaveVerificationDefaults}
                >
                  {savingVerification
                    ? "Saving..."
                    : "Save verification rules"}
                </Button>
              </div>

              {verificationMessage && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {verificationMessage}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Public portal configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Globe2 className="h-4 w-4 text-blue-500" />
                Public verification portal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Configure how the public verification page behaves when
                someone enters a certificate ID (DigiLocker-style view).
              </p>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      Enable public verification portal
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Allow anyone with a valid Certificate ID to verify
                      details without logging in.
                    </p>
                  </div>
                  <Switch
                    checked={publicLookupEnabled}
                    onCheckedChange={setPublicLookupEnabled}
                    disabled={savingPortal}
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      Show organization name
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Display the issuing organization in the public view
                      (useful for colleges and partner companies).
                    </p>
                  </div>
                  <Switch
                    checked={showOrgNameOnPublic}
                    onCheckedChange={setShowOrgNameOnPublic}
                    disabled={savingPortal}
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      Allow public PDF download
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Show a “View &amp; Download” button that renders the
                      certificate PDF on the public verification page.
                    </p>
                  </div>
                  <Switch
                    checked={allowPublicPdfDownload}
                    onCheckedChange={setAllowPublicPdfDownload}
                    disabled={savingPortal}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Changes apply to{" "}
                  <span className="font-semibold">/verify</span> and any
                  public-facing certificate views.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={savingPortal}
                  onClick={handleSavePortalSettings}
                >
                  {savingPortal ? "Saving..." : "Save portal settings"}
                </Button>
              </div>

              {portalMessage && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {portalMessage}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: system overview + danger zone */}
        <div className="flex w-full flex-col gap-4 lg:w-80">
          {/* System overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <DatabaseZap className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                System overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Admin account
                  </span>
                  <span className="truncate text-right font-medium text-slate-900 dark:text-slate-50">
                    {user?.email ?? "admin@example.com"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Role
                  </span>
                  <Badge
                    variant="outline"
                    className="border-slate-300 text-[10px] uppercase tracking-wide dark:border-slate-700"
                  >
                    {user?.role ?? "admin"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Managed entities
                  </span>
                  <span className="text-[11px] font-medium text-slate-900 dark:text-slate-50">
                    Organizations, users, certificates
                  </span>
                </div>
              </div>

              <Separator className="my-2" />

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Use{" "}
                <span
                  className="cursor-pointer font-semibold text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
                  onClick={() => router.push("/admin/organizations")}
                >
                  Admin &gt; Organizations
                </span>{" "}
                to onboard colleges, TPOs, and partner companies before
                issuing certificates.
              </p>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 w-full justify-center gap-1"
                onClick={() => router.push("/admin/organizations")}
              >
                <FileBadge2 className="h-3 w-3" />
                Manage organizations
              </Button>
            </CardContent>
          </Card>

          {/* Maintenance / Danger zone */}
          <Card className="border-amber-200 dark:border-amber-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                <Bell className="h-4 w-4" />
                Maintenance &amp; sandbox actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                These actions are typically used in testing or by super
                admins. Avoid running them on production without
                understanding the impact.
              </p>

              <div className="space-y-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full justify-center gap-1"
                  disabled={runningMaintenance}
                  onClick={handleRebuildSearchIndex}
                >
                  <RefreshCw className="h-3 w-3" />
                  {runningMaintenance
                    ? "Running maintenance..."
                    : "Rebuild certificate index"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="w-full justify-center gap-1"
                  disabled={runningMaintenance}
                  onClick={handleClearTestData}
                >
                  <Trash2 className="h-3 w-3" />
                  Clear test data
                </Button>
              </div>

              <div className="flex items-start gap-2 rounded-md bg-amber-50 p-2 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-3 w-3" />
                <p>
                  Use the <span className="font-semibold">Clear test data</span>{" "}
                  action only in demo or sandbox environments. Certificates
                  already shared externally may still be cached by third
                  parties.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
