// app/certificate/[code]/print-client.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function CertificatePrintClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print(); // user can choose "Save as PDF"
    }
  };

  return (
    <>
      {/* Top controls – hidden in print */}
      <div className="mb-4 flex justify-center gap-2 print:hidden">
        <Button onClick={handlePrint}>Download as PDF</Button>
      </div>

      {/* Printable content */}
      <div className="print:bg-white print:m-0 print:p-0">{children}</div>
    </>
  );
}
