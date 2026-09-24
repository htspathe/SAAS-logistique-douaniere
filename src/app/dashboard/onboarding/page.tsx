import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { signOut } from "@/app/auth/actions";
import { createOrganization } from "@/app/dashboard/organisation/actions";
import { getOrganizationContext } from "@/lib/organizations/server";

export const metadata: Metadata = { title: "Votre entreprise" };

export default async function OnboardingPage({ searchParams }: {
  searchParams: Promise<{ erreur?: string | string[] }>;
}) {
  const context = await getOrganizationContext();
  if (context.membership) redirect("/dashboard");
  const { erreur } = await searchParams;
  const error = erreur === "nom"
    ? "Le nom doit comporter entre 2 et 120 caractères, sur une seule ligne."
    : erreur === "creation" ? "L’entreprise n’a pas pu être créée. Réessayez dans un instant." : null;

  return (
    <AuthShell eyebrow="Votre premier espace" title="Bienvenue dans votre entreprise."
      description="Transitaire ou PME importatrice et exportatrice : créez l’espace qui regroupera vos opérations au Sénégal.">
      {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form action={createOrganization} className="space-y-5">
        <label className="block text-xs font-bold text-slate-700">
          Nom de l’entreprise
          <input name="name" required minLength={2} maxLength={120} autoComplete="organization"
            placeholder="Ex. Dakar Transit" className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
        </label>
        <p className="text-xs leading-6 text-slate-500">Vous en deviendrez le propriétaire. Si votre entreprise dispose déjà d’un espace, contactez son responsable avant d’en créer un autre.</p>
        <SubmitButton label="Créer mon entreprise" />
      </form>
      <form action={signOut} className="mt-6 text-center">
        <button className="text-xs font-semibold text-slate-500 underline">Se déconnecter</button>
      </form>
    </AuthShell>
  );
}
