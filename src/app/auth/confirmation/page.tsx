import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Confirmez votre e-mail" };

export default function ConfirmationPage() {
  return (
    <AuthShell
      eyebrow="Compte créé"
      title="Consultez votre boîte e-mail."
      description="Nous vous avons envoyé un lien sécurisé pour confirmer votre adresse."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <MailCheck className="mx-auto size-10 text-[#0ca898]" />
        <p className="mt-4 text-sm font-bold text-[#09223e]">
          Cliquez sur le lien reçu pour activer votre compte.
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Pensez à vérifier le dossier des courriers indésirables.
        </p>
        <Link href="/auth/connexion" className="mt-6 inline-flex text-xs font-bold text-[#087f75] hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </AuthShell>
  );
}
