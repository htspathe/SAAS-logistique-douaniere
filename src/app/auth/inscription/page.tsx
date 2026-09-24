import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { signUp } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Créer un compte" };

type PageProps = {
  searchParams: Promise<{ erreur?: string | string[] }>;
};

export default async function RegistrationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = typeof params.erreur === "string" ? params.erreur : undefined;

  return (
    <AuthShell
      eyebrow="Premiers pas"
      title="Créez votre espace TransitFlow."
      description="Le compte servira ensuite à créer ou rejoindre votre entreprise."
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      <form action={signUp} className="space-y-5">
        <label className="block text-xs font-bold text-slate-700">
          Nom complet
          <input
            required
            name="fullName"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0ca898] focus:ring-2 focus:ring-teal-100"
            placeholder="Awa Diop"
          />
        </label>
        <label className="block text-xs font-bold text-slate-700">
          Adresse e-mail professionnelle
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0ca898] focus:ring-2 focus:ring-teal-100"
            placeholder="vous@entreprise.sn"
          />
        </label>
        <label className="block text-xs font-bold text-slate-700">
          Mot de passe
          <input
            required
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0ca898] focus:ring-2 focus:ring-teal-100"
          />
          <span className="mt-2 block text-[10px] font-normal text-slate-400">
            12 caractères minimum.
          </span>
        </label>
        <SubmitButton label="Créer mon compte" />
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">
        Déjà inscrit ?{" "}
        <Link href="/auth/connexion" className="font-bold text-[#087f75] hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
