// app/admin/interns/page.tsx
"use client";

import * as React from "react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export default function AdminInternsPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [viewRole, setViewRole] = React.useState<"user" | "admin">("user");
  const [page, setPage] = React.useState(1);

  // create form
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newRole, setNewRole] = React.useState<"user" | "admin">("user");
  const [creating, setCreating] = React.useState(false);
  const [createMessage, setCreateMessage] = React.useState<string | null>(null);
  const [createError, setCreateError] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(
    async (opts?: { page?: number; role?: "user" | "admin"; q?: string }) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("/api/admin/users", {
          params: {
            page: opts?.page ?? page,
            role: opts?.role ?? viewRole,
            q: opts?.q ?? search,
          },
        });

        const data = res.data as {
          users: AdminUser[];
          pagination: Pagination;
        };

        setUsers(data.users || []);
        setPagination(data.pagination);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load accounts."
        );
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [page, viewRole, search]
  );

  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await loadUsers({ page: 1 });
  };

  const handleRoleFilterChange = async (role: "user" | "admin") => {
    setViewRole(role);
    setPage(1);
    await loadUsers({ page: 1, role });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateMessage(null);
    setCreateError(null);

    try {
      const res = await axios.post("/api/admin/users", {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });

      setCreateMessage(res.data?.message || "Account created.");
      setNewName("");
      setNewEmail("");
      setNewPassword("");

      // reload list from page 1 for this role
      setPage(1);
      await loadUsers({ page: 1, role: newRole });
    } catch (err: any) {
      console.error(err);
      setCreateError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create account."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const res = await axios.patch(`/api/admin/users/${user.id}`, {
        isActive: !user.isActive,
      });

      const updated = res.data?.user as AdminUser;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update account."
      );
    }
  };

  const handleChangeRole = async (user: AdminUser, role: "admin" | "user") => {
    try {
      const res = await axios.patch(`/api/admin/users/${user.id}`, {
        role,
      });

      const updated = res.data?.user as AdminUser;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to change role."
      );
    }
  };

  const handleDeactivate = async (user: AdminUser) => {
    if (
      !window.confirm(
        `Deactivate account for ${user.email}? They won't be able to log in.`
      )
    ) {
      return;
    }

    try {
      const res = await axios.delete(`/api/admin/users/${user.id}`);
      const updated = res.data?.user as AdminUser;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to deactivate account."
      );
    }
  };

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-0 space-y-4 lg:space-y-6">
      <h1 className="text-lg font-semibold sm:text-xl">
        User &amp; Intern Account Management
      </h1>

      {/* On small/medium: stack cards; on xl: two columns */}
      <div className="grid gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* List / search */}
        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold sm:text-base">
              Accounts ({viewRole === "user" ? "Interns/Users" : "Admins"})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search + filters */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  disabled={loading}
                >
                  Search
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewRole === "user" ? "default" : "outline"}
                  onClick={() => handleRoleFilterChange("user")}
                >
                  Interns/Users
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewRole === "admin" ? "default" : "outline"}
                  onClick={() => handleRoleFilterChange("admin")}
                >
                  Admins
                </Button>
              </div>
            </form>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {/* Scrollable table container */}
            <div className="overflow-x-auto rounded-md border border-slate-200 text-sm dark:border-slate-800">
              <table className="min-w-[720px]">
                <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600 dark:bg-slate-900/70 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-4 text-center text-sm"
                      >
                        Loading accounts...
                      </td>
                    </tr>
                  )}

                  {!loading && users.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-4 text-center text-sm text-slate-500"
                      >
                        No accounts found.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-3 py-2">
                          {u.name || <span className="italic">No name</span>}
                        </td>
                        <td className="px-3 py-2">{u.email}</td>
                        <td className="px-3 py-2">
                          <Select
                            value={u.role}
                            onValueChange={(value) =>
                              handleChangeRole(u, value as "admin" | "user")
                            }
                          >
                            <SelectTrigger className="w-[120px] rounded border border-slate-300 bg-transparent px-2 py-1 text-xs dark:border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          {u.isActive ? (
                            <Badge className="bg-green-600 text-xs text-white hover:bg-green-700">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-500 text-xs text-white hover:bg-slate-600">
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-right space-x-2">
                          <Button
                            size="sm"
                            variant={u.isActive ? "outline" : "default"}
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.isActive ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivate(u)}
                            disabled={!u.isActive}
                          >
                            Deactivate
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex flex-col gap-2 pt-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
                <span>
                  Page {currentPage} of {totalPages} •{" "}
                  {pagination.total} account(s)
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={currentPage <= 1 || loading}
                    onClick={async () => {
                      const next = currentPage - 1;
                      setPage(next);
                      await loadUsers({ page: next });
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={currentPage >= totalPages || loading}
                    onClick={async () => {
                      const next = currentPage + 1;
                      setPage(next);
                      await loadUsers({ page: next });
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create new account */}
        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold sm:text-base">
              Create New Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {createMessage && (
              <p className="text-xs text-green-600 dark:text-green-400">
                {createMessage}
              </p>
            )}
            {createError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {createError}
              </p>
            )}

            <form className="space-y-3 sm:space-y-4" onSubmit={handleCreate}>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Name (optional)
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">Email</label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">
                  Temporary password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">Role</label>
                <Select
                  value={newRole}
                  onValueChange={(value) =>
                    setNewRole(value as "admin" | "user")
                  }
                >
                  <SelectTrigger className="w-full rounded border border-slate-300 bg-transparent px-2 py-1 text-sm dark:border-slate-700">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User / Intern</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Accounts created here can log in with email &amp; password. You
              can later change their role or disable access from the table.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
