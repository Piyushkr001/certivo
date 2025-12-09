// app/dashboard/settings/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import {
  ShieldCheck,
  Bell,
  KeyRound,
  LogOut,
  AlertTriangle,
  Mail,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Security: change password
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [passwordMessage, setPasswordMessage] =
    React.useState<string | null>(null);
  const [passwordError, setPasswordError] =
    React.useState<string | null>(null);

  // Notifications
  const [notifyInternship, setNotifyInternship] = React.useState(true);
  const [notifySecurity, setNotifySecurity] = React.useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] =
    React.useState(false);
  const [notifSaving, setNotifSaving] = React.useState(false);
  const [notifMessage, setNotifMessage] =
    React.useState<string | null>(null);
  const [notifError, setNotifError] = React.useState<string | null>(null);
  const [notifLoading, setNotifLoading] = React.useState(false);

  // Misc
  const [loadingAction, setLoadingAction] = React.useState(false);

  // 🔄 Load notification preferences from API when user is known
  React.useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadNotificationPrefs() {
      try {
        setNotifLoading(true);
        const res = await axios.get<{
          notifyInternship: boolean;
          notifySecurity: boolean;
          notifyAnnouncements: boolean;
        }>("/api/user/settings/notifications");

        if (cancelled) return;

        setNotifyInternship(
          res.data.notifyInternship ?? true
        );
        setNotifySecurity(
          res.data.notifySecurity ?? true
        );
        setNotifyAnnouncements(
          res.data.notifyAnnouncements ?? false
        );
      } catch (err) {
        // If loading fails, just keep defaults and log error
        console.error("Load notification prefs error:", err);
      } finally {
        if (!cancelled) setNotifLoading(false);
      }
    }

    void loadNotificationPrefs();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // 👉 Change password → /api/user/change-password
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill out all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await axios.post("/api/user/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordMessage(
        res.data?.message || "Password updated successfully."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
    } catch (err: any) {
      console.error("Change password error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password. Please try again.";
      setPasswordError(msg);
      setPasswordMessage(null);
    } finally {
      setPasswordSaving(false);
    }
  }

  // 👉 Save notifications → /api/user/settings/notifications
  async function handleSaveNotifications() {
    setNotifSaving(true);
    setNotifMessage(null);
    setNotifError(null);

    try {
      const res = await axios.post(
        "/api/user/settings/notifications",
        {
          notifyInternship,
          notifySecurity,
          notifyAnnouncements,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setNotifMessage(
        res.data?.message || "Notification preferences saved."
      );
    } catch (err: any) {
      console.error("Save notifications error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save preferences. Please try again.";
      setNotifError(msg);
    } finally {
      setNotifSaving(false);
    }
  }

  // 👉 Logout all → /api/auth/logout-all
  const handleLogoutAllSessions = async () => {
    setLoadingAction(true);
    try {
      await axios.post("/api/auth/logout-all");
      // After clearing cookie, send user to login
      router.push("/login");
    } catch (err: any) {
      console.error("Logout all sessions error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to log out. Please try again.";
      alert(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  // 👉 Deactivate account → /api/user/deactivate
  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account? You will not be able to log in until an administrator reactivates it."
    );
    if (!confirmed) return;

    try {
      const res = await axios.post("/api/user/deactivate");
      alert(
        res.data?.message ||
          "Your account has been deactivated. You will be redirected."
      );
      router.replace("/");
    } catch (err: any) {
      console.error("Deactivate account error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to deactivate account. Please try again.";
      alert(msg);
    }
  };

  const roleLabel =
    user?.role === "admin" ? "Administrator" : "Student / User";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Manage security, notification preferences, and account options
            for your Certivo dashboard.
          </p>
        </div>
        {user && (
          <Badge className="w-fit justify-center gap-1 bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
            <ShieldCheck className="h-3 w-3" />
            {roleLabel}
          </Badge>
        )}
      </div>

      {/* Main layout: flex with responsive columns */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left column: security + notifications */}
        <div className="flex-1 space-y-4">
          {/* Security / password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                Security &amp; password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Update your password regularly to keep your internship
                dashboard secure. This will affect both web login and future
                linked devices.
              </p>

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    disabled={passwordSaving}
                  />
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={passwordSaving}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm new password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      autoComplete="new-password"
                      disabled={passwordSaving}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Use at least 8 characters, including a number and a
                    symbol for better security.
                  </p>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={passwordSaving}
                  >
                    {passwordSaving
                      ? "Updating password..."
                      : "Update password"}
                  </Button>
                </div>

                {passwordError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">
                    {passwordError}
                  </p>
                )}

                {passwordMessage && !passwordError && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    {passwordMessage}
                  </p>
                )}
              </form>

              <Separator className="my-2" />

              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                  Active sessions
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  If you suspect unusual activity, you can log out from all
                  devices linked to your account.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 gap-1"
                  type="button"
                  onClick={handleLogoutAllSessions}
                  disabled={loadingAction}
                >
                  <LogOut className="h-3 w-3" />
                  {loadingAction
                    ? "Logging out..."
                    : "Log out from all devices"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Bell className="h-4 w-4 text-blue-500" />
                Notification preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Choose which email notifications you want to receive from
                Certivo.
              </p>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      Internship updates
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Get notified when new certificates are added or
                      updated.
                    </p>
                  </div>
                  <Switch
                    checked={notifyInternship}
                    onCheckedChange={setNotifyInternship}
                    disabled={notifSaving || notifLoading}
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      Security alerts
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Important login alerts, password changes and new
                      device sign-ins.
                    </p>
                  </div>
                  <Switch
                    checked={notifySecurity}
                    onCheckedChange={setNotifySecurity}
                    disabled={notifSaving || notifLoading}
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-slate-100">
                      Announcements &amp; updates
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Product updates, new features and internship resources.
                    </p>
                  </div>
                  <Switch
                    checked={notifyAnnouncements}
                    onCheckedChange={setNotifyAnnouncements}
                    disabled={notifSaving || notifLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  We only send relevant updates. You can opt out at any time.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotifications}
                  disabled={notifSaving || notifLoading}
                >
                  {notifSaving ? "Saving..." : "Save preferences"}
                </Button>
              </div>

              {notifError && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {notifError}
                </p>
              )}

              {notifMessage && !notifError && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {notifMessage}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: account & danger zone */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Account summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Account details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Mail className="h-3 w-3" />
                  Email
                </span>
                <span className="truncate text-right font-medium text-slate-900 dark:text-slate-50">
                  {user?.email ?? "email@example.com"}
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
                  {user?.role ?? "user"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Shield className="h-3 w-3" />
                  Verification
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Secured with JWT
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                These details are managed by your administrator and linked to
                your internship records. To change email or role, please
                contact support.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-1 w-full justify-center"
              >
                <Link href="/dashboard/profile">
                  Review profile information
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-red-200 dark:border-red-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                Danger zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Deactivating your account will disable login and hide your
                certificates from the dashboard. This does not delete
                certificates already shared with organizations.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-center"
                type="button"
                onClick={handleDeactivateAccount}
              >
                Deactivate account
              </Button>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                To permanently remove your data from Certivo, please contact
                your institution or support team with a written request.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
