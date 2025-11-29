"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";
import { useAuth } from "../auth/AuthContext"; // ⬅️ JWT auth context

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    // (Optional) call your backend logout endpoint here
    // await fetch("/api/auth/logout", { method: "POST", credentials: "include" });

    logout();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur shadow-md",
        "bg-linear-to-r from-slate-50 via-blue-50 to-slate-50 text-slate-900",
        "dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 dark:text-slate-100",
        "border-slate-200/80 dark:border-slate-800/70"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/Images/Logo/logo.svg"
            alt="Certivo Logo"
            width={150}
            height={150}
            className="h-10 w-auto"
          />
          <span className="hidden text-lg font-semibold tracking-wide sm:inline-block">
            Certi
            <span className="text-blue-600 dark:text-blue-300">vo</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "transition-colors",
                "hover:text-blue-700 dark:hover:text-blue-200",
                isActive(link.href)
                  ? "text-blue-700 dark:text-blue-100 font-semibold"
                  : "text-slate-700/90 dark:text-slate-200/80"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop auth + mode toggle */}
        <div className="hidden items-center gap-3 md:flex">
          <ModeToggle />

          {!isLoading && user ? (
            <>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "hover:text-blue-700 dark:hover:text-blue-100",
                  "hover:bg-slate-200/70 dark:hover:bg-slate-900/60",
                  "text-slate-800 dark:text-slate-100"
                )}
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className={cn(
                  "border-slate-300 text-slate-900 hover:bg-slate-100",
                  "dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                )}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "hover:text-blue-700 dark:hover:text-blue-100",
                  "hover:bg-slate-200/70 dark:hover:bg-slate-900/60",
                  "text-slate-800 dark:text-slate-100"
                )}
              >
                <Link href="/login">Login</Link>
              </Button>

              <Button
                asChild
                className={cn(
                  "bg-blue-600 text-white shadow-md shadow-blue-500/40 hover:bg-blue-700",
                  "dark:bg-blue-500 dark:hover:bg-blue-600"
                )}
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-md p-2 md:hidden",
            "border border-slate-300/80 bg-white/70 text-slate-900 hover:bg-slate-100",
            "dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
          )}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className={cn(
            "border-t md:hidden",
            "border-slate-200/80 bg-white/95",
            "dark:border-slate-800/70 dark:bg-slate-950/95"
          )}
        >
          <div className="px-4 pb-4 pt-2">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive(link.href)
                      ? "bg-slate-200 text-blue-700 dark:bg-slate-900 dark:text-blue-100"
                      : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="mt-3 flex items-center gap-2">
              {!isLoading && user ? (
                <>
                  <Button
                    variant="outline"
                    asChild
                    className={cn(
                      "flex-1",
                      "border-slate-300 text-slate-900 hover:bg-slate-100",
                      "dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                    )}
                  >
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>

                  <Button
                    className={cn(
                      "flex-1 bg-blue-600 text-white hover:bg-blue-700",
                      "dark:bg-blue-500 dark:hover:bg-blue-600"
                    )}
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    asChild
                    className={cn(
                      "flex-1",
                      "border-slate-300 text-slate-900 hover:bg-slate-100",
                      "dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                    )}
                  >
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className={cn(
                      "flex-1 bg-blue-600 text-white hover:bg-blue-700",
                      "dark:bg-blue-500 dark:hover:bg-blue-600"
                    )}
                  >
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}

              {/* Mode toggle on mobile */}
              <div className="ml-1">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
