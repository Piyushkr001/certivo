// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  type?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactPayload;

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const subject = (body.subject ?? "").trim();
    const message = (body.message ?? "").trim();
    const type = (body.type ?? "other").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          message: "Name, email, and message are required.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    // Ensure SMTP env variables are present
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      console.error("SMTP configuration is missing in environment variables.");
      return NextResponse.json(
        {
          message:
            "Email service is not configured. Please contact administrator.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for 465, false otherwise
      auth: {
        user,
        pass,
      },
    });

    const toEmail =
      process.env.CONTACT_TO_EMAIL || process.env.SMTP_FROM_EMAIL || user;

    const finalSubject =
      subject || `New contact message from ${name} (${type})`;

    const html = `
      <p>You have received a new contact message from the Certivo website.</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>User type:</strong> ${type}</p>
      <p><strong>Subject:</strong> ${finalSubject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM_EMAIL ||
        `"Certivo Contact" <${user}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Certivo Contact] ${finalSubject}`,
      html,
    });

    return NextResponse.json(
      {
        message:
          "Thank you for reaching out. Your message has been received and we will get back to you soon.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      {
        message:
          "Something went wrong while sending your message. Please try again later.",
      },
      { status: 500 }
    );
  }
}
