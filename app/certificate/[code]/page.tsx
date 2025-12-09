// app/certificate/[code]/page.tsx
import { db } from "@/config/db";
import { certificates, users } from "@/config/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CertificatePrintClient } from "./print-client";

type PageProps = {
  params: { code: string };
};

export default async function CertificatePage({ params }: PageProps) {
  const code = decodeURIComponent(params.code);

  const [cert] = await db
    .select({
      id: certificates.id,
      code: certificates.code,
      holderName: certificates.holderName,
      program: certificates.program,
      organizationName: certificates.organizationName,
      durationText: certificates.durationText,
      issuedAt: certificates.issuedAt,
      userName: users.name,
    })
    .from(certificates)
    .leftJoin(users, eq(certificates.userId, users.id))
    .where(eq(certificates.code, code))
    .limit(1);

  if (!cert) notFound();

  const issuedDate =
    cert.issuedAt instanceof Date
      ? cert.issuedAt.toLocaleDateString(undefined, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 print:bg-white">
      <CertificatePrintClient>
        <div
          id="certificate"
          className="relative w-[900px] max-w-full bg-[#fdfaf3] text-slate-900 border-12 border-slate-800 shadow-2xl print:shadow-none print:border-8"
        >
          {/* inner border */}
          <div className="pointer-events-none absolute inset-4 border border-[#d4af37]/60" />

          <div className="relative px-16 py-12">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-[10px] tracking-[0.35em] uppercase text-slate-500">
                Certificate of Internship
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[0.18em] uppercase text-slate-900">
                Certificate of Completion
              </h1>
            </div>

            {/* Body */}
            <p className="text-center text-sm text-slate-600">
              This is to certify that
            </p>
            <p className="mt-3 text-center text-3xl font-semibold text-slate-900">
              {cert.holderName}
            </p>

            <p className="mt-6 text-center text-sm leading-relaxed text-slate-700 max-w-2xl mx-auto">
              has successfully completed the{" "}
              <span className="font-semibold">{cert.program}</span>
              {cert.organizationName && (
                <>
                  {" "}
                  at{" "}
                  <span className="font-semibold">
                    {cert.organizationName}
                  </span>
                </>
              )}
              {cert.durationText && (
                <>
                  {" "}
                  during{" "}
                  <span className="font-semibold">
                    {cert.durationText}
                  </span>
                </>
              )}
              .
            </p>

            {/* Footer info */}
            <div className="mt-10 flex justify-between items-end text-xs text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">
                  Certificate ID
                </p>
                <p className="font-mono text-[11px]">{cert.code}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">
                  Issued on
                </p>
                <p>{issuedDate}</p>
              </div>
            </div>

            {/* Signature area */}
            <div className="mt-12 flex justify-between items-center">
              <div className="flex flex-col items-start gap-1">
                <div className="h-px w-40 bg-slate-500" />
                <p className="text-[11px] font-semibold text-slate-800">
                  Authorized Signatory
                </p>
                <p className="text-[10px] text-slate-600">
                  Internship Coordinator
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Verified Online at
                </p>
                <p className="text-[11px] font-mono text-slate-800">
                  certivo.yourdomain.com/verify
                </p>
              </div>
            </div>
          </div>
        </div>
      </CertificatePrintClient>
    </div>
  );
}
