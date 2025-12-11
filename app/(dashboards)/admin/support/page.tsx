// app/admin/support/page.tsx
"use client";

import * as React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  LifeBuoy,
  Filter,
  AlertCircle,
  Mail,
  Clock,
  User as UserIcon,
} from "lucide-react";

type SupportTicket = {
  id: number;
  subject: string;
  description: string;
  category: string;
  userEmail?: string | null;
  userName?: string | null;
  userRole?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
};

type StatusFilter = "all" | "open" | "in_progress" | "resolved";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>("open");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    async function loadTickets() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("status", statusFilter);
        params.set("limit", "100");

        const res = await fetch(`/api/admin/support?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Unable to load support tickets.");
        }

        if (cancelled) return;
        setTickets(data as SupportTicket[]);
      } catch (err: any) {
        console.error("Load support tickets error:", err);
        if (!cancelled) {
          setError(
            err?.message || "Failed to load support tickets."
          );
          setTickets([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTickets();

    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.toLowerCase();
    return tickets.filter((t) => {
      return (
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.userEmail ?? "").toLowerCase().includes(q) ||
        (t.userName ?? "").toLowerCase().includes(q)
      );
    });
  }, [tickets, search]);

  function statusChip(status: string) {
    const s = status.toLowerCase();
    if (s === "resolved") {
      return (
        <Badge className="bg-emerald-500/15 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          Resolved
        </Badge>
      );
    }
    if (s === "in_progress") {
      return (
        <Badge className="bg-amber-500/15 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
          In progress
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/15 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
        Open
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 hidden rounded-md bg-slate-900/90 p-2 text-slate-50 dark:bg-slate-100 dark:text-slate-900 sm:block">
            <LifeBuoy className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Support Requests
            </h1>
            <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
              View support tickets submitted from the Support page. Use this
              to track certificate issues, login problems, and verification
              questions raised by students or TPOs.
            </p>
          </div>
        </div>

        <Badge className="w-fit bg-slate-900 text-[11px] font-medium uppercase tracking-wide text-slate-100 dark:bg-slate-100 dark:text-slate-900">
          Admin • Support
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
            <Filter className="h-3 w-3" />
            Status:
          </span>
          <div className="inline-flex gap-1 rounded-md bg-slate-50 p-1 text-[11px] dark:bg-slate-900/70">
            {(["all", "open", "in_progress", "resolved"] as StatusFilter[]).map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`rounded px-2 py-1 capitalize ${
                    statusFilter === value
                      ? "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-700 hover:bg-slate-200/80 dark:text-slate-200 dark:hover:bg-slate-800/70"
                  }`}
                >
                  {value.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by subject, email, or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full max-w-xs text-xs"
          />
        </div>
      </div>

      {/* Tickets list */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Tickets ({filtered.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Latest 100 tickets based on the selected filter. Extend this
            page later for status updates and internal notes if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100 text-left text-[11px] uppercase text-slate-600 dark:bg-slate-900/70 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm"
                    >
                      Loading support tickets...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-400"
                    >
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No tickets found for this filter.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  filtered.map((t) => (
                    <tr
                      key={t.id}
                      className="bg-white align-top text-xs dark:bg-slate-900/80"
                    >
                      <td className="max-w-xs px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="line-clamp-2 font-medium text-slate-900 dark:text-slate-50">
                              {t.subject}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-[11px] text-slate-600 dark:text-slate-300">
                            {t.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1 text-[11px] text-slate-800 dark:text-slate-100">
                            <UserIcon className="h-3 w-3" />
                            {t.userName || "Unknown user"}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <Mail className="h-3 w-3" />
                            {t.userEmail || "—"}
                          </span>
                          {t.userRole && (
                            <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Role: {t.userRole}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {t.category || "general"}
                      </td>
                      <td className="px-4 py-3">
                        {statusChip(t.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(t.createdAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && !error && filtered.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
              Showing latest {filtered.length} ticket
              {filtered.length !== 1 && "s"}. Extend this page later for
              status updates and internal notes if needed.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
