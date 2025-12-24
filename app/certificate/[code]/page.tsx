// app/certificate/[code]/page.tsx
import * as React from "react";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { certificates } from "@/config/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  // ✅ Next.js 16: params is a Promise in server components
  params: Promise<{ code: string }>;
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadgeVariant(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "verified") return "default";
  if (s === "pending") return "secondary";
  if (s === "rejected") return "destructive";
  return "outline";
}

export default async function CertificatePage({ params }: PageProps) {
  // ✅ must unwrap params
  const { code: rawCode } = await params;

  let code = rawCode;
  try {
    code = decodeURIComponent(rawCode);
  } catch {
    // keep as-is if decode fails
  }

  const [cert] = await db
    .select({
      id: certificates.id,
      code: certificates.code,
      holderName: certificates.holderName,
      program: certificates.program,
      organizationName: certificates.organizationName,
      durationText: certificates.durationText,
      issuedAt: certificates.issuedAt,
      status: certificates.status,
      verifiedAt: certificates.verifiedAt,
    })
    .from(certificates)
    .where(eq(certificates.code, code))
    .limit(1);

  if (!cert) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg sm:text-xl">
              Certificate Details
            </CardTitle>

            <Badge variant={statusBadgeVariant(String(cert.status))}>
              {String(cert.status || "—")}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Use this page to verify and view certificate information.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Certificate Code</p>
              <p className="mt-1 font-mono text-sm">{cert.code}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Issued On</p>
              <p className="mt-1 text-sm">{formatDate(cert.issuedAt)}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Holder Name</p>
              <p className="mt-1 text-sm font-medium">{cert.holderName}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Program / Domain</p>
              <p className="mt-1 text-sm font-medium">{cert.program}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Organization</p>
              <p className="mt-1 text-sm">{cert.organizationName || "—"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="mt-1 text-sm">{cert.durationText || "—"}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Verified At</p>
              <p className="mt-1 text-sm">{formatDate(cert.verifiedAt)}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Internal ID</p>
              <p className="mt-1 text-sm">{cert.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
