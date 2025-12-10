// app/admin/organizations/page.tsx
"use client";

import * as React from "react";
import axios from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import {
  Building2,
  Filter,
  Plus,
  Mail,
  ShieldCheck,
  Pencil,
} from "lucide-react";

type OrganizationType = "college" | "company" | "tpo" | string;

type AdminOrganization = {
  id: number;
  name: string;
  type: OrganizationType;
  contactEmail?: string | null;
  contactPerson?: string | null;
  totalCertificates?: number | null;
  isActive: boolean;
  createdAt: string; // ISO string from DB
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function typeLabel(type: OrganizationType) {
  if (!type) return "Other";
  switch (type) {
    case "college":
      return "College / University";
    case "company":
      return "Company / Partner";
    case "tpo":
      return "Training & Placement Cell";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = React.useState<AdminOrganization[] | null>(
    null
  );
  const [loadingList, setLoadingList] = React.useState(false);
  const [listError, setListError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<
    OrganizationType | "all"
  >("all");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");

  // Create / Edit organization form
  const [showCreate, setShowCreate] = React.useState(false);
  const [editingOrgId, setEditingOrgId] = React.useState<number | null>(
    null
  );

  const [name, setName] = React.useState("");
  const [orgType, setOrgType] =
    React.useState<OrganizationType>("college");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [createMessage, setCreateMessage] =
    React.useState<string | null>(null);
  const [createError, setCreateError] =
    React.useState<string | null>(null);

  // Toggle active state
  const [togglingId, setTogglingId] = React.useState<number | null>(
    null
  );

  // Load organizations from backend
  const loadOrganizations = React.useCallback(async () => {
    try {
      setLoadingList(true);
      setListError(null);

      const res = await axios.get<AdminOrganization[]>(
        "/api/admin/organizations",
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setOrgs(res.data || []);
    } catch (err: any) {
      console.error("Load organizations error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load organizations.";
      setListError(msg);
      setOrgs([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  React.useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  // Reset form to create-mode
  function resetForm() {
    setEditingOrgId(null);
    setName("");
    setContactEmail("");
    setContactPerson("");
    setOrgType("college");
    setCreateMessage(null);
    setCreateError(null);
  }

  // Create or update organization
  async function handleSubmitOrg(e: React.FormEvent) {
    e.preventDefault();
    setCreateMessage(null);
    setCreateError(null);

    if (!name.trim()) {
      setCreateError("Organization name is required.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: name.trim(),
        type: orgType,
        contactEmail: contactEmail.trim() || null,
        contactPerson: contactPerson.trim() || null,
      };

      let res;

      if (editingOrgId) {
        // EDIT mode → PATCH /api/admin/organizations/:id
        res = await axios.patch(
          `/api/admin/organizations/${editingOrgId}`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setCreateMessage(
          res.data?.message || "Organization updated successfully."
        );
      } else {
        // CREATE mode → POST /api/admin/organizations
        res = await axios.post(
          "/api/admin/organizations",
          payload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setCreateMessage(
          res.data?.message || "Organization created successfully."
        );
      }

      resetForm();
      setShowCreate(true); // keep form visible
      await loadOrganizations();
    } catch (err: any) {
      console.error("Save organization error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save organization.";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  }

  // Load selected org into form for editing
  function handleEditOrg(org: AdminOrganization) {
    setShowCreate(true);
    setEditingOrgId(org.id);
    setName(org.name);
    setOrgType(org.type);
    setContactEmail(org.contactEmail ?? "");
    setContactPerson(org.contactPerson ?? "");
    setCreateMessage(null);
    setCreateError(null);
  }

  // Toggle active / inactive via PATCH
  async function handleToggleActive(org: AdminOrganization) {
    setTogglingId(org.id);
    try {
      await axios.patch(
        `/api/admin/organizations/${org.id}`,
        {
          isActive: !org.isActive,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      await loadOrganizations();
    } catch (err: any) {
      console.error("Toggle active error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update organization status.";
      alert(msg);
    } finally {
      setTogglingId(null);
    }
  }

  const filteredOrgs = React.useMemo(() => {
    if (!orgs) return [];
    const term = search.trim().toLowerCase();

    return orgs.filter((org) => {
      const matchesSearch =
        !term ||
        org.name.toLowerCase().includes(term) ||
        (org.contactEmail || "")
          .toLowerCase()
          .includes(term) ||
        (org.contactPerson || "")
          .toLowerCase()
          .includes(term);

      const matchesType =
        typeFilter === "all" || org.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && org.isActive) ||
        (statusFilter === "inactive" && !org.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [orgs, search, typeFilter, statusFilter]);

  const isEditMode = editingOrgId !== null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Organizations
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Manage colleges, universities, companies and TPOs that
            issue or verify certificates through Certivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            type="button"
            onClick={() => {
              const next = !showCreate;
              setShowCreate(next);
              if (!next) {
                resetForm();
              }
            }}
          >
            <Plus className="h-3 w-3" />
            {showCreate ? "Hide form" : "Add organization"}
          </Button>
        </div>
      </div>

      {/* Create / Edit organization form */}
      {showCreate && (
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4 text-slate-900 dark:text-slate-100" />
              {isEditMode ? "Edit organization" : "New organization"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmitOrg}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Organization name
                  </label>
                  <Input
                    placeholder="e.g. BIT Mesra, Zidio Development"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={creating}
                  />
                </div>
                <div className="w-full md:w-64 space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Type
                  </label>
                  <Select
                    value={orgType}
                    onValueChange={(value) =>
                      setOrgType(value as OrganizationType)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="college">
                        College / University
                      </SelectItem>
                      <SelectItem value="company">
                        Company / Partner
                      </SelectItem>
                      <SelectItem value="tpo">
                        Training &amp; Placement Cell
                      </SelectItem>
                      <SelectItem value="other">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Contact email (optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. tpo@example.edu"
                    value={contactEmail}
                    onChange={(e) =>
                      setContactEmail(e.target.value)
                    }
                    disabled={creating}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Contact person (optional)
                  </label>
                  <Input
                    placeholder="e.g. Dr. Sharma (TPO)"
                    value={contactPerson}
                    onChange={(e) =>
                      setContactPerson(e.target.value)
                    }
                    disabled={creating}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isEditMode
                    ? "Updating an existing partner will reflect across dashboards."
                    : "These details help you track which certificates belong to which partner institutions."}
                </p>
                <div className="flex gap-2">
                  {isEditMode && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={resetForm}
                      disabled={creating}
                    >
                      Cancel edit
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={creating}
                  >
                    {creating
                      ? isEditMode
                        ? "Saving changes..."
                        : "Saving..."
                      : isEditMode
                      ? "Save changes"
                      : "Create organization"}
                  </Button>
                </div>
              </div>

              {createError && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {createError}
                </p>
              )}
              {createMessage && !createError && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {createMessage}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters + list */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Filter className="h-4 w-4 text-slate-500" />
              Organizations
            </CardTitle>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by name, email, contact person..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 text-xs md:w-64"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={typeFilter}
                  onValueChange={(value) =>
                    setTypeFilter(
                      value as OrganizationType | "all"
                    )
                  }
                >
                  <SelectTrigger className="h-9 w-[130px] text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="tpo">TPO</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(
                      value as "all" | "active" | "inactive"
                    )
                  }
                >
                  <SelectTrigger className="h-9 w-[130px] text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Loading / error / empty states */}
          {loadingList && (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-full animate-pulse rounded-lg bg-slate-100/80 dark:bg-slate-800/60"
                />
              ))}
            </div>
          )}

          {!loadingList && listError && (
            <div className="p-4 text-sm text-red-600 dark:text-red-400">
              {listError}
            </div>
          )}

          {!loadingList &&
            !listError &&
            filteredOrgs.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No organizations found. Try adjusting filters or add a
                new organization.
              </div>
            )}

          {!loadingList &&
            !listError &&
            filteredOrgs.length > 0 && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrgs.map((org) => (
                  <div
                    key={org.id}
                    className="flex flex-col gap-3 bg-white px-4 py-3 text-sm dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          {org.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-slate-300 text-[10px] uppercase tracking-wide dark:border-slate-700"
                        >
                          {typeLabel(org.type)}
                        </Badge>
                        {org.isActive ? (
                          <Badge className="flex items-center gap-1 bg-emerald-500/10 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                            <ShieldCheck className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-200/70 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Inactive
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {org.contactEmail && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {org.contactEmail}
                          </span>
                        )}
                        {org.contactPerson && (
                          <>
                            <Separator
                              orientation="vertical"
                              className="hidden h-3 md:block"
                            />
                            <span>Contact: {org.contactPerson}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-1 flex flex-col items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 md:mt-0 md:items-end">
                      <span>
                        Certificates:{" "}
                        <span className="font-medium text-slate-900 dark:text-slate-50">
                          {org.totalCertificates ?? "—"}
                        </span>
                      </span>
                      <span>
                        Added on:{" "}
                        <span className="font-medium text-slate-900 dark:text-slate-50">
                          {formatDate(org.createdAt)}
                        </span>
                      </span>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleEditOrg(org)}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant={org.isActive ? "outline" : "default"}
                          size="sm"
                          className="gap-1"
                          onClick={() => handleToggleActive(org)}
                          disabled={togglingId === org.id}
                        >
                          {org.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
