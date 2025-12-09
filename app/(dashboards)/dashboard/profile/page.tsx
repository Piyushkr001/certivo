// app/dashboard/profile/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/app/auth/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Mail, Shield, User as UserIcon, Edit3 } from "lucide-react";

type ProfileApiResponse = {
  id: number;
  name: string | null;
  email: string;
  role: "admin" | "user";
  headline: string | null;
  about: string | null;
  picture?: string | null;
  createdAt?: string | null;
};

type InitialProfile = {
  name: string;
  headline: string;
  about: string;
};

export default function ProfilePage() {
  const { user } = useAuth();

  const [fullName, setFullName] = React.useState("");
  const [headline, setHeadline] = React.useState("");
  const [about, setAbout] = React.useState("");
  const [initialProfile, setInitialProfile] =
    React.useState<InitialProfile | null>(null);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = React.useState(false);

  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Load profile from API
  React.useEffect(() => {
    if (!user) return;

    const authUser = user;
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoadingProfile(true);
        setError(null);

        const res = await axios.get<ProfileApiResponse>(
          "/api/user/profile",
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (cancelled) return;

        const data = res.data;
        const name = data.name ?? authUser.name ?? "";
        const hl = data.headline ?? "";
        const ab = data.about ?? "";

        setFullName(name);
        setHeadline(hl);
        setAbout(ab);
        setInitialProfile({ name, headline: hl, about: ab });

        // avatar: API picture → JWT picture → null
        const picture =
          data.picture ?? (authUser as any)?.picture ?? null;
        setAvatarUrl(picture);
      } catch (err: any) {
        if (cancelled) return;
        console.error("Load profile error:", err);

        setFullName(authUser.name ?? "");
        setHeadline("");
        setAbout("");
        setAvatarUrl((authUser as any)?.picture ?? null);

        setError(
          err?.response?.data?.message ||
            "Unable to load profile details right now."
        );
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    setError(null);

    try {
      const payload = {
        name: fullName,
        headline,
        about,
      };

      const res = await axios.patch<{
        message: string;
        user: ProfileApiResponse;
      }>("/api/user/profile", payload, {
        headers: { "Content-Type": "application/json" },
      });

      const updated = res.data.user;
      const name = updated.name ?? "";
      const hl = updated.headline ?? "";
      const ab = updated.about ?? "";

      setFullName(name);
      setHeadline(hl);
      setAbout(ab);
      setInitialProfile({ name, headline: hl, about: ab });

      setSaveMessage(res.data.message || "Profile updated.");
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const handleReset = () => {
    if (!initialProfile) return;
    setFullName(initialProfile.name);
    setHeadline(initialProfile.headline);
    setAbout(initialProfile.about);
    setSaveMessage(null);
    setError(null);
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setAvatarUploading(true);

    // Optional: optimistic preview
    const tempUrl = URL.createObjectURL(file);
    setAvatarUrl(tempUrl);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.post<{
        message: string;
        picture: string;
      }>("/api/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAvatarUrl(res.data.picture);
      setSaveMessage(res.data.message);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to update avatar. Please try again."
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const roleLabel =
    user?.role === "admin" ? "Administrator" : "Student / User";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Manage your personal information, internship details, and
            account security from one place.
          </p>
        </div>

        {user && (
          <Badge className="w-fit justify-center gap-1 bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
            <Shield className="h-3 w-3" />
            {roleLabel}
          </Badge>
        )}
      </div>

      {/* Main layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left column – profile form */}
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={avatarUrl ?? undefined}
                      alt={user?.name ?? "Profile picture"}
                    />
                    <AvatarFallback>
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-base font-semibold">
                      {user?.name || "Your name"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user?.email || "email@example.com"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    type="button"
                    onClick={handleAvatarButtonClick}
                    disabled={avatarUploading || loadingProfile}
                  >
                    <Edit3 className="h-3 w-3" />
                    {avatarUploading ? "Uploading..." : "Edit avatar"}
                  </Button>
                  {/* Hidden file input */}
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Max 2 MB. JPG, PNG, or WebP recommended.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                {/* Name & headline – flex on larger screens */}
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={loadingProfile || saving}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="headline">
                      Headline / current role
                    </Label>
                    <Input
                      id="headline"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Web Development Intern"
                      disabled={loadingProfile || saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email ?? ""}
                    readOnly
                    disabled
                    className="bg-slate-50 text-slate-500 dark:bg-slate-900/40 dark:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Email is linked to your verified Certivo account and
                    cannot be edited here.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about">About / internship summary</Label>
                  <Textarea
                    id="about"
                    rows={4}
                    value={about}
                    onChange={(
                      e: React.ChangeEvent<HTMLTextAreaElement>
                    ) => setAbout(e.target.value)}
                    placeholder="Briefly describe your internship, skills, or interests. This can be shown to recruiters."
                    disabled={loadingProfile || saving}
                  />
                </div>

                <Separator className="my-2" />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Need to change your email or role?{" "}
                    <span className="font-medium">
                      Contact your administrator.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={loadingProfile || saving || !initialProfile}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={saving || loadingProfile}
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </div>

                {loadingProfile && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Loading profile details…
                  </p>
                )}

                {error && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                {saveMessage && !error && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    {saveMessage}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column – account & security summary */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Account overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Account type
                </span>
                <Badge
                  variant="outline"
                  className="border-slate-300 text-[10px] uppercase tracking-wide dark:border-slate-700"
                >
                  {user?.role ?? "user"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Login method
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  Email &amp; password / Google
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Certificates linked
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {/* replace with real count if you add it to the API */}
                  —
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Your account is protected with JWT-based authentication and
                role-based access control. Keep your credentials safe and
                avoid sharing your certificate ID publicly.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">
                <li>HttpOnly cookie for session security</li>
                <li>Separate admin / user access</li>
                <li>Verify certificates before downloading</li>
              </ul>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2 w-full justify-center"
              >
                <Link href="/dashboard/verify">
                  Review verified certificates
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
