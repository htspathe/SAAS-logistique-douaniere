import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { signIn } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Connexion" };

type PageProps = {
  searchParams: Promise<{
    erreur?: string | string[];
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = typeof params.erreur === "string" ? params.erreur : undefined;
  const next = safeRedirectPath(
    typeof params.next === "string" ? params.next : undefined,
  );

  return (
    <AuthShell
      eyebrow="Espace sécurisé"
      title="Bon retour parmi nous."
      description="Connectez-vous pour retrouver vos expéditions, documents et alertes."
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      <form action={signIn} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <label className="block text-xs font-bold text-slate-700">
          Adresse e-mail
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
            autoComplete="current-password"
            className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#0ca898] focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <SubmitButton label="Se connecter" />
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">
        Pas encore de compte ?{" "}
        <Link href="/auth/inscription" className="font-bold text-[#087f75] hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}
