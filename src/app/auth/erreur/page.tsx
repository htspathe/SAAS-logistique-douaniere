import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Authentification interrompue" };

export default function AuthErrorPage() {
  return (
    <AuthShell
      eyebrow="Authentification"
      title="L’action n’a pas abouti."
      description="Le lien peut être expiré ou le service momentanément indisponible."
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <CircleAlert className="mx-auto size-10 text-amber-600" />
        <p className="mt-4 text-xs leading-5 text-amber-900">
          Réessayez depuis la page de connexion. Si un lien de confirmation a expiré, demandez un nouveau lien avant de poursuivre.
        </p>
        <Link href="/auth/connexion" className="mt-5 inline-flex text-xs font-bold text-amber-900 underline">
          Aller à la connexion
        </Link>
      </div>
    </AuthShell>
  );
}
