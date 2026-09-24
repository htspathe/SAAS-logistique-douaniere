import type { ReactNode } from "react";
import Link from "next/link";
import { Anchor, ShieldCheck } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-[#f5f7fa] lg:grid-cols-[0.85fr_1.15fr]">
      <section className="relative hidden overflow-hidden bg-[#071827] p-12 text-white lg:flex lg:flex-col">
        <div className="landing-grid absolute inset-0 opacity-[0.08]" />
        <div className="absolute -left-36 top-20 size-96 rounded-full bg-[#0ca898]/20 blur-[100px]" />
        <Link href="/" className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#0ca898]">
            <Anchor className="size-5" />
          </span>
          <span>
            <span className="block text-base font-extrabold">TransitFlow</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#72d9ce]">
              Sénégal
            </span>
          </span>
        </Link>

        <div className="relative my-auto max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#72d9ce]">
            Pilotage logistique sécurisé
          </p>
          <h2 className="mt-5 text-5xl font-black leading-[1.04] tracking-[-0.05em]">
            Vos opérations import-export, réunies au même endroit.
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300">
            Dossiers, documents douaniers, échéances et suivi maritime pour les
            transitaires et PME du Sénégal.
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-[10px] font-semibold text-slate-400">
          <ShieldCheck className="size-4 text-[#72d9ce]" />
          Authentification de votre espace TransitFlow
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden">
            <span className="grid size-9 place-items-center rounded-lg bg-[#09223e] text-white">
              <Anchor className="size-4" />
            </span>
            <span className="text-sm font-extrabold text-[#09223e]">
              TransitFlow Sénégal
            </span>
          </Link>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0ca898]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#09223e] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
