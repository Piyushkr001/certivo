"use client";

import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";
import { XLogoIcon } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer
      className={cn(
        "border-t",
        "border-slate-200/80 bg-slate-50",
        "dark:border-slate-800/70 dark:bg-slate-950"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Top section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand + small description */}
          <div className="flex flex-col gap-3 max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-lg font-semibold tracking-wide text-slate-900 dark:text-slate-50">
                Certi
                <span className="text-blue-600 dark:text-blue-300">vo</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Certivo helps institutions issue and verify internship certificates
              online with secure, reliable, and instant verification workflows.
            </p>
          </div>

          {/* Links section */}
          <div className="flex flex-1 flex-col gap-6 md:flex-row md:justify-end">
            {/* Product links */}
            <div className="min-w-[140px]">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Product
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Verify / Admin */}
            <div className="min-w-[140px]">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                For Users
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/dashboard/verify"
                    className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    Verify Certificate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal / Contact */}
            <div className="min-w-40">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Legal & Contact
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="mt-1 flex items-center gap-2 px-0 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    <Link href="/support">
                      <Mail className="h-4 w-4" />
                      <span>Support</span>
                    </Link>
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <Separator className="my-6 bg-slate-200 dark:bg-slate-800" />

        {/* Bottom section */}
        <div className="flex flex-col gap-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Certivo. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wide">
              Connect
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                <Link href='https://x.com/' target= "_blank" rel="noopener noreferrer">
                <XLogoIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                 <Link href='https://linkedin.com/' target= "_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                 <Link href='https://facebook.com/' target= "_blank" rel="noopener noreferrer">
                <Facebook className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                <Link href='https://instagram.com/' target= "_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
