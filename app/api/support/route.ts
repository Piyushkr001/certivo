// app/api/support/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

import { verifyAuthJwt } from "@/lib/auth-jwt";
import { db } from "@/config/db";
import { supportTickets } from "@/config/schema";

export const runtime = "nodejs"; // required for nodemailer

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const subject = String(body.subject ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = String(body.category ?? "").trim() || "general";

    if (!subject || !description) {
      return NextResponse.json(
        { message: "Subject and description are required." },
        { status: 400 }
      );
    }

    // Try to read logged-in user from JWT cookie (optional)
    let userEmail: string | undefined;
    let userName: string | undefined;
    let userRole: string | undefined;

    try {
      const token = (await cookies()).get("certivo_token")?.value ?? null;
      if (token) {
        const payload = await verifyAuthJwt(token);
        userEmail = (payload as any).email;
        userName = (payload as any).name;
        userRole = (payload as any).role;
      }
    } catch (err) {
      // If decoding fails, treat as anonymous support request
      console.warn(
        "Support: failed to decode JWT payload (continuing as anonymous):",
        err
      );
    }

    // 1️⃣ Persist ticket in DB
    await db.insert(supportTickets).values({
      subject,
      description,
      category,
      userEmail,
      userName,
      userRole,
      status: "open",
    });

    // 2️⃣ Send email via SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT
      ? Number(process.env.SMTP_PORT)
      : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const supportInbox =
      process.env.CONTACT_TO_EMAIL || process.env.SMTP_FROM_EMAIL || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass || !supportInbox) {
      console.error("Support API: Missing SMTP environment variables.");
      return NextResponse.json(
        {
          message:
            "Support email is not configured on the server. Please contact the administrator.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const emailSubject = `[Certivo Support] ${subject}`;

    const userInfoLines = [
      userName ? `Name: ${userName}` : null,
      userEmail ? `Email: ${userEmail}` : null,
      userRole ? `Role: ${userRole}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const textBody = [
      `New support request from Certivo Support page`,
      "",
      `Category: ${category}`,
      userInfoLines ? `\n${userInfoLines}` : "",
      "",
      "Description:",
      description,
    ].join("\n");

    const htmlBody = `
      <h2>New Certivo Support Request</h2>
      <p><strong>Category:</strong> ${category}</p>
      ${
        userInfoLines
          ? `<p><strong>User details:</strong><br/>${userInfoLines
              .split("\n")
              .join("<br/>")}</p>`
          : ""
      }
      <p><strong>Description:</strong></p>
      <p>${description.replace(/\n/g, "<br/>")}</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || smtpUser,
      to: supportInbox,
      subject: emailSubject,
      text: textBody,
      html: htmlBody,
      replyTo: userEmail || undefined,
    });

    return NextResponse.json(
      {
        message:
          "Your support request has been logged and sent to the support team.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json(
      {
        message:
          "Something went wrong while submitting your support request.",
      },
      { status: 500 }
    );
  }
}
