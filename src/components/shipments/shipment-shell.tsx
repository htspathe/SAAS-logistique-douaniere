import type { ReactNode } from "react";
import Link from "next/link";

export function ShipmentShell({ title, organizationName, children, backHref = "/dashboard/expeditions", backLabel = "Toutes les expéditions" }: {
  title: string; organizationName: string; children: ReactNode; backHref?: string; backLabel?: string;
}) {
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8 sm:py-10">
    <div className="mx-auto max-w-5xl">
      <Link href={backHref} className="text-sm font-semibold text-teal-800 underline">{backLabel}</Link>
      <p className="mt-8 break-words text-sm text-slate-600">{organizationName}</p>
      <h1 className="mt-2 break-words text-3xl font-bold tracking-tight">{title}</h1>
      <div className="mt-8">{children}</div>
    </div>
  </main>;
}
