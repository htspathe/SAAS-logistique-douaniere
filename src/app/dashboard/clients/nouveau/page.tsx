import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { requireOrganization } from "@/lib/organizations/server";
import { canWriteClients } from "@/lib/clients/validation";

export const metadata: Metadata = { title: "Nouveau client" };

export default async function NewClientPage() {
  const { membership } = await requireOrganization();
  if (!canWriteClients(membership.role)) redirect("/dashboard/clients?erreur=acces");
  return <main className="min-h-screen bg-[#f5f7fa] px-5 py-10 text-[#09223e]">
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard/clients" className="text-sm font-semibold text-teal-700 hover:underline">Retour aux clients</Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-widest text-teal-700">{membership.organization.name}</p>
      <h1 className="mt-3 text-3xl font-bold">Nouveau client</h1>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <ClientForm organizationId={membership.organization_id} />
      </section>
    </div>
  </main>;
}
