// app/(dashboard)/_components/EmptyState.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmptyState({ title, description, ctaHref, ctaText }: { title: string; description: string; ctaHref?: string; ctaText?: string; }) {
  return (
    <Card className="text-center">
      <CardContent className="py-10">
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        {ctaHref && (
          <Link href={ctaHref}>
            <Button>{ctaText ?? "Get started"}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
