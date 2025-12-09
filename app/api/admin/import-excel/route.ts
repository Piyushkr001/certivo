// app/api/admin/import-excel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as XLSX from "xlsx";
import { db } from "@/config/db";
import {
  users,
  certificates,
  certificateActivities,
} from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { verifyAuthJwt } from "@/lib/auth-jwt";

export const runtime = "nodejs"; // needed for xlsx in Next

type ImportRow = {
  Name: string;
  Email: string;
  Program: string;
  OrganizationName?: string;
  DurationText?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateCertificateCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `CERT-INT-${year}-${random}`;
}

async function requireAdmin() {
  const token = (await cookies()).get("certivo_token")?.value ?? null;
  if (!token) throw new Error("UNAUTHENTICATED");

  const payload = await verifyAuthJwt(token);
  const role = (payload as any).role;

  if (role !== "admin") throw new Error("FORBIDDEN");

  return {
    id: Number((payload as any).sub),
    email: (payload as any).email as string,
  };
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "Excel file is required (field name 'file')." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet, { defval: "" });

    if (!rows.length) {
      return NextResponse.json(
        { message: "No rows found in Excel sheet." },
        { status: 400 }
      );
    }

    let totalRows = 0;
    let createdUsers = 0;
    let existingUsers = 0;
    let createdCertificates = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      totalRows++;
      const rowNumber = index + 2; // header is row 1

      const name = row.Name?.trim();
      const email = row.Email?.trim().toLowerCase();
      const program = row.Program?.trim();
      const organizationName = row.OrganizationName?.trim() || null;
      const durationText = row.DurationText?.trim() || null;

      // ✅ required fields
      if (!name || !email || !program) {
        errors.push(
          `Row ${rowNumber}: Name, Email and Program are required.`
        );
        continue;
      }

      // ✅ basic email format check (extra data-integrity guard)
      if (!EMAIL_REGEX.test(email)) {
        errors.push(
          `Row ${rowNumber}: Invalid email format (${email}).`
        );
        continue;
      }

      // 1. Upsert user (role user)
      let userRecord =
        (await db.query.users.findFirst({
          where: and(eq(users.email, email), eq(users.role, "user")),
        })) ?? null;

      if (!userRecord) {
        const [createdUser] = await db
          .insert(users)
          .values({
            name,
            email,
            role: "user",
            isActive: true,
          })
          .returning();
        userRecord = createdUser;
        createdUsers++;
      } else {
        existingUsers++;
      }

      // 2. Create certificate
      let code = generateCertificateCode();
      let created = false;
      let retries = 0;

      while (!created && retries < 5) {
        try {
          const [cert] = await db
            .insert(certificates)
            .values({
              code,
              userId: userRecord.id,
              issuedByAdminId: admin.id,
              holderName: name,
              program,
              organizationName,
              durationText,
              status: "verified", // or "pending"
            })
            .returning();

          await db.insert(certificateActivities).values({
            certificateId: cert.id,
            adminId: admin.id,
            activityType: "imported",
            description: `Certificate ${code} imported for ${name} (${email}).`,
          });

          createdCertificates++;
          created = true;
        } catch (err: any) {
          const msg = String(err?.message ?? "");
          if (msg.includes("duplicate") || msg.includes("unique")) {
            // regenerate code on unique constraint violation
            code = generateCertificateCode();
            retries++;
          } else {
            errors.push(
              `Row ${rowNumber}: Failed to create certificate for ${email} – ${msg}`
            );
            created = true;
          }
        }
      }
    }

    return NextResponse.json(
      {
        message: "Import completed.",
        summary: {
          totalRows,
          createdUsers,
          existingUsers,
          createdCertificates,
          errorCount: errors.length,
        },
        errors,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Import Excel error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can import Excel data." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
