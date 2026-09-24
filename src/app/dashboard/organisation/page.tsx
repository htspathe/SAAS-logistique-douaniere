import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, UsersRound } from "lucide-react";
import { z } from "zod";
import { SubmitButton } from "@/components/auth/submit-button";
import { renameOrganization, switchOrganization } from "@/app/dashboard/organisation/actions";
import { requireOrganization } from "@/lib/organizations/server";
import { canManageOrganization, organizationRoleSchema, roleLabels } from "@/lib/organizations/validation";

export const metadata: Metadata = { title: "Mon entreprise" };

const memberSchema = z.object({ user_id: z.string().uuid(), role: organizationRoleSchema, is_active: z.boolean() });

export default async function OrganizationPage({ searchParams }: {
  searchParams: Promise<{ erreur?: string | string[]; succes?: string | string[] }>;
}) {
  const { supabase, claims, memberships, membership } = await requireOrganization();
  const { data, error } = await supabase.from("organization_members")
    .select("user_id, role, is_active").eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: true });
  if (error) throw new Error("Impossible de charger les membres de votre entreprise.");
  const members = z.array(memberSchema).parse(data);
  const params = await searchParams;
  const messages: Record<string, string> = {
    nom: "Le nom doit comporter entre 2 et 120 caractères, sur une seule ligne.",
    acces: "Vous ne disposez pas des droits nécessaires pour cette action.",
    modification: "La modification n’a pas abouti. Réessayez dans un instant.",
  };
  const message = typeof params.erreur === "string" ? messages[params.erreur] : undefined;

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-5 py-10 text-[#09223e] sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-700"><ArrowLeft className="size-4" />Tableau de bord</Link>
        <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Entreprise active</p>
        <h1 className="mt-3 break-words text-3xl font-bold">{membership.organization.name}</h1>
        <p className="mt-2 text-sm text-slate-500">Votre rôle : {roleLabels[membership.role]}</p>
        {message && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{message}</p>}
        {params.succes === "1" && <p role="status" className="mt-6 rounded-lg bg-teal-50 p-4 text-sm text-teal-800">Le nom de l’entreprise a été enregistré.</p>}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 flex items-center gap-2 font-bold"><Building2 className="size-5" />Informations de l’entreprise</h2>
          {canManageOrganization(membership.role) ? (
            <form action={renameOrganization} className="space-y-4">
              <input type="hidden" name="organizationId" value={membership.organization_id} />
              <label className="block text-sm font-semibold">Nom
                <input name="name" defaultValue={membership.organization.name} required minLength={2} maxLength={120}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-3 font-normal focus:outline-teal-500" />
              </label>
              <SubmitButton label="Enregistrer le nom" />
            </form>
          ) : <p className="text-sm text-slate-600">Seuls les propriétaires et administrateurs peuvent modifier le nom de l’entreprise.</p>}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 flex items-center gap-2 font-bold"><UsersRound className="size-5" />Membres ({members.length})</h2>
          <ul className="divide-y divide-slate-100">
            {members.map((member) => <li key={member.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span>{member.user_id === claims.sub ? "Vous" : `Membre ${member.user_id.slice(0, 8)}`}</span>
              <span className="text-slate-500">{roleLabels[member.role]} · {member.is_active ? "Actif" : "Désactivé"}</span>
            </li>)}
          </ul>
          <p className="mt-4 text-xs text-slate-500">Les invitations et la modification des rôles seront disponibles à une prochaine étape.</p>
        </section>

        {memberships.length > 1 && <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-bold">Changer d’entreprise</h2>
          <form action={switchOrganization} className="space-y-4">
            <label className="block text-sm font-semibold">Entreprise
              <select name="organizationId" defaultValue={membership.organization_id} className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-3">
                {memberships.map((item) => <option key={item.organization_id} value={item.organization_id}>{item.organization.name}</option>)}
              </select>
            </label>
            <SubmitButton label="Ouvrir cette entreprise" />
          </form>
        </section>}
      </div>
    </main>
  );
}
