import type { Metadata } from "next";
import { Ubuntu_Sans } from "next/font/google";
import "./globals.css";

import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./auth/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const ubuntu = Ubuntu_Sans({
  variable: "--font-ubuntu-sans",
  subsets: ["latin"],
});

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export const metadata: Metadata = {
  title: "Certivo",
  description: "Certivo - Certificate Verification Made Easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={ubuntu.className}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
