// app/admin/certificates/_components/ExcelImportForm.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ExcelImportForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    summary: {
      totalRows: number;
      createdUsers: number;
      existingUsers: number;
      createdCertificates: number;
      errorCount: number;
    };
    errors: string[];
  }>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an Excel file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/import-excel", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Import failed.");
        return;
      }

      setResult({
        summary: data.summary,
        errors: data.errors ?? [],
      });

      // refresh certificates list
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Import Certificates from Excel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Excel file (.xlsx / .xls)
            </label>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Required columns: <b>Name</b>, <b>Email</b>, <b>Program</b>.{" "}
              Optional: <b>OrganizationName</b>, <b>DurationText</b>.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading || !file}>
            {loading ? "Importing..." : "Import Excel"}
          </Button>
        </form>

        {result && (
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">Import summary:</p>
            <ul className="list-disc list-inside">
              <li>Total rows: {result.summary.totalRows}</li>
              <li>New users created: {result.summary.createdUsers}</li>
              <li>Existing users matched: {result.summary.existingUsers}</li>
              <li>
                Certificates created: {result.summary.createdCertificates}
              </li>
              <li>Rows with errors: {result.summary.errorCount}</li>
            </ul>

            {result.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-muted-foreground">
                  Show row errors
                </summary>
                <ul className="mt-1 list-disc list-inside text-xs text-red-500">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
