import type { Metadata } from "next";
import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  BellRing,
  Box,
  Building2,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  FileCheck2,
  FileText,
  Fingerprint,
  Globe2,
  Landmark,
  LockKeyhole,
  MapPin,
  Navigation,
  Radar,
  Route,
  ShieldCheck,
  Ship,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "TransitFlow SN | Pilotez vos expéditions sans angle mort",
  },
  description:
    "Plateforme sénégalaise de suivi logistique et douanier pour transitaires, importateurs et exportateurs.",
};

const capabilities = [
  { value: "Import + Export", label: "Deux flux, un seul espace" },
  { value: "FCL + LCL", label: "Conteneurs et groupage" },
  { value: "E-mail + WhatsApp", label: "Alertes automatisées" },
  { value: "AIS + ETA", label: "Visibilité maritime" },
];

const features = [
  {
    number: "01",
    icon: Route,
    title: "Pilotez chaque dossier",
    text: "Imports, exports, FCL et LCL suivent un parcours commun, avec les étapes adaptées à chaque opération.",
    tags: ["Timeline", "Échéances", "Responsables"],
  },
  {
    number: "02",
    icon: FileCheck2,
    title: "Centralisez vos documents",
    text: "BL, factures, déclarations et preuves de livraison restent classés, versionnés et accessibles aux bonnes personnes.",
    tags: ["Coffre-fort", "Versions", "Partage contrôlé"],
  },
  {
    number: "03",
    icon: BellRing,
    title: "Anticipez les blocages",
    text: "Les équipes et les clients sont prévenus avant une arrivée, une échéance ou lorsqu'une pièce manque au dossier.",
    tags: ["Alertes", "E-mail", "WhatsApp"],
  },
];

const audiences = [
  {
    icon: Ship,
    title: "Transitaires",
    text: "Un cockpit opérationnel pour gérer plusieurs clients et dossiers sans multiplier les fichiers.",
  },
  {
    icon: Landmark,
    title: "Déclarants",
    text: "Des formalités, documents et statuts douaniers suivis dans le même historique.",
  },
  {
    icon: Building2,
    title: "PME import-export",
    text: "Une vision simple de la marchandise, des délais et des actions encore nécessaires.",
  },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="TransitFlow SN — Accueil">
      <span className={`grid size-10 place-items-center rounded-xl ${inverse ? "bg-white text-[#09223e]" : "bg-[#09223e] text-white"}`}>
        <Anchor className="size-[19px]" strokeWidth={2.2} />
      </span>
      <span>
        <span className={`block text-[15px] font-extrabold leading-none tracking-[-0.02em] ${inverse ? "text-white" : "text-[#09223e]"}`}>
          TransitFlow
        </span>
        <span className={`mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] ${inverse ? "text-[#74d8cd]" : "text-[#0ca898]"}`}>
          Sénégal
        </span>
      </span>
    </Link>
  );
}

function ContainerScene() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[620px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0d2b47] shadow-[0_40px_90px_rgba(0,0,0,0.3)]">
      <div className="landing-grid absolute inset-0 opacity-30" />
      <div className="absolute inset-x-0 bottom-0 h-[31%] bg-gradient-to-b from-[#0a9f9a] to-[#087d81]">
        <div className="sea-lines absolute inset-0 opacity-30" />
      </div>

      <div className="absolute left-[8%] top-[10%] flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-[10px] font-semibold text-white backdrop-blur-md">
        <span className="size-1.5 rounded-full bg-[#56e0c9] shadow-[0_0_10px_#56e0c9]" />
        Zone portuaire de Dakar
      </div>

      <div className="absolute right-[7%] top-[9%] rounded-xl border border-white/10 bg-[#071b2e]/80 p-3 text-white shadow-xl backdrop-blur-md">
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">ETA mise à jour</p>
        <p className="mt-1 text-sm font-bold">23 sept. · 08:30</p>
      </div>

      <div className="absolute left-1/2 top-0 h-[24%] w-px -translate-x-1/2 bg-[#e9c63f]" />
      <div className="absolute left-1/2 top-[22%] z-10 grid size-9 -translate-x-1/2 place-items-center rounded-full border-2 border-[#e9c63f] bg-[#0d2b47] text-[#e9c63f]">
        <Box className="size-4" />
      </div>

      <div className="absolute left-[12%] top-[36%] z-10 w-[76%] -rotate-[2deg]">
        <div className="container-ribs relative h-[132px] overflow-hidden rounded-[8px] border border-white/10 bg-[#081827] shadow-[0_30px_45px_rgba(0,0,0,0.4)] sm:h-[165px]">
          <div className="absolute inset-y-0 left-0 w-3 bg-black/30" />
          <div className="absolute inset-y-0 right-0 w-3 bg-black/30" />
          <div className="absolute left-7 top-6 flex items-center gap-2 text-white sm:left-10 sm:top-8">
            <span className="grid size-8 place-items-center rounded-lg bg-[#10aa9c] sm:size-10">
              <Anchor className="size-4 sm:size-5" />
            </span>
            <div>
              <p className="text-xl font-black tracking-[-0.04em] sm:text-3xl">TRANSITFLOW</p>
              <p className="text-[7px] font-bold uppercase tracking-[0.28em] text-[#7ee0d5] sm:text-[9px]">
                Visibility moves cargo
              </p>
            </div>
          </div>
          <p className="absolute bottom-4 right-5 font-mono text-[8px] text-slate-400 sm:bottom-6 sm:right-8 sm:text-[10px]">
            TRFU 240926 5 · SN
          </p>
        </div>
      </div>

      <div className="absolute bottom-[12%] left-[5%] z-20 w-[45%] rotate-[2deg]">
        <div className="container-ribs h-[64px] rounded-md bg-[#e9c63f] shadow-2xl sm:h-[82px]">
          <p className="pl-5 pt-4 text-[9px] font-black uppercase tracking-[0.16em] text-[#171b1e] sm:pl-7 sm:pt-5 sm:text-[11px]">
            Import · FCL
          </p>
        </div>
      </div>

      <div className="absolute bottom-[7%] right-[6%] z-30 w-[43%] rounded-xl border border-white/10 bg-white/95 p-3.5 shadow-2xl sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Dossier suivi</p>
            <p className="mt-1 text-xs font-extrabold text-[#09223e] sm:text-sm">Istanbul → Dakar</p>
          </div>
          <CircleCheck className="size-5 text-[#0ca898]" />
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[68%] rounded-full bg-[#0ca898]" />
        </div>
        <div className="mt-2 flex justify-between text-[8px] font-semibold text-slate-400">
          <span>En mer</span><span>68 %</span>
        </div>
      </div>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto max-w-[1080px] rounded-[24px] border border-white/10 bg-[#0b1f34] p-2 shadow-[0_50px_120px_rgba(0,0,0,0.45)] sm:p-3">
      <div className="overflow-hidden rounded-[18px] bg-[#f5f7fa]">
        <div className="flex h-10 items-center gap-1.5 border-b border-slate-200 bg-white px-4">
          <span className="size-2 rounded-full bg-[#ff6b6b]" />
          <span className="size-2 rounded-full bg-[#e9c63f]" />
          <span className="size-2 rounded-full bg-[#0ca898]" />
          <span className="ml-4 hidden rounded-md bg-slate-100 px-16 py-1 text-[7px] text-slate-400 sm:block">app.transitflow.sn/dashboard</span>
        </div>
        <div className="grid min-h-[430px] md:grid-cols-[180px_1fr]">
          <aside className="hidden bg-[#09223e] p-4 text-white md:block">
            <div className="mb-7 flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-[#0ca898]"><Anchor className="size-3.5" /></span>
              <span className="text-[10px] font-bold">TransitFlow</span>
            </div>
            {["Vue d'ensemble", "Expéditions", "Trafic maritime", "Documents", "Clients"].map((item, index) => (
              <div key={item} className={`mb-1 rounded-md px-3 py-2 text-[8px] ${index === 0 ? "bg-white/10 text-white" : "text-slate-400"}`}>{item}</div>
            ))}
          </aside>
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#0ca898]">Tableau de bord</p>
                <h3 className="mt-1 text-lg font-extrabold tracking-tight text-[#09223e] sm:text-xl">Vos opérations, en un regard.</h3>
              </div>
              <span className="rounded-md bg-[#0ca898] px-3 py-2 text-[8px] font-bold text-white">+ Expédition</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[["24", "Dossiers actifs"], ["11", "En mer"], ["5", "En douane"], ["3", "Alertes"]].map(([value, label], index) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className={`mb-3 size-2 rounded-full ${index === 3 ? "bg-[#e9c63f]" : "bg-[#0ca898]"}`} />
                  <p className="text-lg font-black text-[#09223e]">{value}</p>
                  <p className="text-[7px] text-slate-400">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1.25fr_.75fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[9px] font-bold text-[#09223e]">Expéditions récentes</p>
                  <p className="text-[7px] font-semibold text-[#0ca898]">Tout afficher</p>
                </div>
                {["SN-IMP-0042", "SN-IMP-0038", "SN-EXP-0031"].map((reference, index) => (
                  <div key={reference} className="grid grid-cols-[1fr_1.1fr_auto] items-center gap-2 border-t border-slate-100 py-3 text-[7px]">
                    <div><p className="font-bold text-[#09223e]">{reference}</p><p className="mt-1 text-slate-400">{index === 2 ? "Export · FCL" : index === 1 ? "Import · LCL" : "Import · FCL"}</p></div>
                    <p className="text-slate-500">{index === 0 ? "Istanbul → Dakar" : index === 1 ? "Shanghai → Dakar" : "Dakar → Rotterdam"}</p>
                    <span className={`rounded-full px-2 py-1 font-bold ${index === 1 ? "bg-amber-50 text-amber-700" : "bg-teal-50 text-teal-700"}`}>{index === 1 ? "Douane" : "En cours"}</span>
                  </div>
                ))}
              </div>
              <div className="map-grid relative min-h-[190px] overflow-hidden rounded-lg bg-[#dff3f5]">
                <div className="absolute -left-8 top-0 h-full w-[44%] rounded-[45%] bg-[#d8c9a6]" />
                <span className="absolute left-[42%] top-[36%] grid size-7 place-items-center rounded-full bg-[#0ca898] text-white shadow-lg"><Ship className="size-3.5 -rotate-12" /></span>
                <span className="absolute right-[19%] top-[62%] grid size-5 place-items-center rounded-full bg-[#09223e] text-white"><Ship className="size-2.5 rotate-12" /></span>
                <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-white/90 p-3 backdrop-blur">
                  <div className="flex items-center justify-between"><p className="text-[8px] font-bold text-[#09223e]">Trafic maritime</p><span className="size-1.5 rounded-full bg-[#0ca898]" /></div>
                  <p className="mt-1 text-[7px] text-slate-400">Positions et ETA centralisés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-[#f7f5ef] text-[#09223e]">
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center px-5 sm:px-8">
          <Brand inverse />
          <nav className="ml-auto hidden items-center gap-8 text-[11px] font-semibold text-slate-300 lg:flex" aria-label="Navigation du site">
            <a href="#fonctionnalites" className="transition hover:text-white">Fonctionnalités</a>
            <a href="#suivi" className="transition hover:text-white">Suivi maritime</a>
            <a href="#securite" className="transition hover:text-white">Sécurité</a>
            <a href="#pour-qui" className="transition hover:text-white">Pour qui ?</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-10">
            <Link href="/auth/connexion" className="hidden rounded-lg px-3 py-2 text-[11px] font-bold text-white transition hover:bg-white/10 sm:block">Se connecter</Link>
            <Link href="/auth/inscription" className="rounded-lg bg-[#e9c63f] px-3.5 py-2.5 text-[10px] font-extrabold text-[#11202e] transition hover:bg-[#f1d24f] sm:px-4 sm:text-[11px]">Créer un compte</Link>
          </div>
        </div>
      </header>

      <section className="relative bg-[#071827] pb-20 pt-32 text-white sm:pb-28 sm:pt-40">
        <div className="landing-grid absolute inset-0 opacity-[0.09]" />
        <div className="absolute -left-48 top-20 size-[520px] rounded-full bg-[#0ca898]/15 blur-[120px]" />
        <div className="absolute -right-48 bottom-0 size-[520px] rounded-full bg-[#e9c63f]/10 blur-[130px]" />
        <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-10">
          <div className="max-w-[620px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#72d9ce]">
              <Sparkles className="size-3" /> La logistique sénégalaise, mieux connectée
            </div>
            <h1 className="text-[46px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[68px] lg:text-[76px]">
              Chaque expédition, <span className="font-serif font-normal italic text-[#e9c63f]">sous contrôle.</span>
            </h1>
            <p className="mt-7 max-w-[540px] text-sm leading-7 text-slate-300 sm:text-base">
              Centralisez vos dossiers, documents douaniers, alertes et suivis maritimes dans une plateforme conçue pour les réalités de l’import-export au Sénégal.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/inscription" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0ca898] px-5 text-xs font-extrabold text-white transition hover:bg-[#0db8a7]">
                Créer mon compte <ArrowRight className="size-4" />
              </Link>
              <a href="#fonctionnalites" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 text-xs font-bold text-white transition hover:bg-white/10">
                Découvrir la solution <ChevronRight className="size-4" />
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5"><Check className="size-3 text-[#72d9ce]" /> Multi-entreprises</span>
              <span className="flex items-center gap-1.5"><Check className="size-3 text-[#72d9ce]" /> Portail client</span>
              <span className="flex items-center gap-1.5"><Check className="size-3 text-[#72d9ce]" /> Sécurité intégrée</span>
            </div>
          </div>
          <ContainerScene />
        </div>
      </section>

      <section className="border-b border-[#d9d6cc] bg-[#efede5]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 px-5 sm:px-8 lg:grid-cols-4">
          {capabilities.map((item, index) => (
            <div key={item.value} className={`py-7 sm:py-9 ${index % 2 ? "pl-5" : "pr-5"} ${index > 0 ? "lg:border-l lg:border-[#d2cfc4] lg:pl-8" : ""}`}>
              <p className="text-sm font-black tracking-[-0.02em] text-[#09223e] sm:text-base">{item.value}</p>
              <p className="mt-1 text-[9px] text-[#6d746f] sm:text-[10px]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="fonctionnalites" className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0ca898]">Le cœur de la plateforme</p>
              <h2 className="mt-4 max-w-[520px] text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl">Du quai au client, plus aucun angle mort.</h2>
            </div>
            <p className="max-w-[560px] text-sm leading-7 text-[#5c6867] lg:ml-auto">TransitFlow rassemble ce qui était dispersé entre tableurs, dossiers locaux, appels et messages. Chaque acteur retrouve l’information utile, sans exposer les données des autres entreprises.</p>
          </div>

          <div className="mt-16 grid gap-4 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.number} className="group relative overflow-hidden rounded-[22px] border border-[#d9d6cc] bg-[#fdfcf8] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#0ca898]/40 hover:shadow-[0_22px_55px_rgba(9,34,62,0.09)] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#e2f5f2] text-[#087f75]"><Icon className="size-5" /></span>
                    <span className="font-mono text-[10px] font-bold text-[#a0a6a2]">{feature.number}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-black tracking-[-0.03em]">{feature.title}</h3>
                  <p className="mt-3 text-xs leading-6 text-[#697371]">{feature.text}</p>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {feature.tags.map((tag) => <span key={tag} className="rounded-full border border-[#d9d6cc] bg-white px-2.5 py-1.5 text-[8px] font-bold text-[#5e6967]">{tag}</span>)}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative bg-[#071827] px-5 py-24 text-white sm:px-8 sm:py-32">
        <div className="landing-grid absolute inset-0 opacity-[0.07]" />
        <div className="relative mx-auto max-w-[1180px]">
          <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#72d9ce]">Le cockpit opérationnel</p>
              <h2 className="mt-4 max-w-[680px] text-4xl font-black leading-[1.03] tracking-[-0.045em] sm:text-5xl">Une seule vue pour prendre les bonnes décisions.</h2>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#e9c63f]">Ouvrir le tableau de bord <ArrowRight className="size-4" /></Link>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section id="suivi" className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-2">
          <div className="relative min-h-[480px] overflow-hidden rounded-[26px] bg-[#dceff1] shadow-[0_24px_70px_rgba(9,34,62,0.12)]">
            <div className="map-grid absolute inset-0 opacity-70" />
            <div className="absolute -left-[18%] -top-[5%] h-[115%] w-[48%] rotate-[-8deg] rounded-[48%] bg-[#d3c5a4] shadow-[20px_0_60px_rgba(9,34,62,0.1)]" />
            <div className="absolute left-[16%] top-[46%] flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[9px] font-extrabold shadow-lg"><MapPin className="size-3 text-[#0ca898]" /> Port de Dakar</div>
            <svg className="absolute inset-0 size-full" viewBox="0 0 600 480" fill="none" aria-hidden="true">
              <path d="M175 268C250 216 290 158 371 174C424 184 441 230 500 208" stroke="#0ca898" strokeWidth="3" strokeDasharray="8 8" />
            </svg>
            <span className="absolute left-[58%] top-[31%] grid size-12 place-items-center rounded-full bg-[#09223e] text-white shadow-[0_12px_30px_rgba(9,34,62,0.35)]"><Ship className="size-5 -rotate-12" /></span>
            <span className="absolute right-[12%] top-[40%] grid size-8 place-items-center rounded-full bg-[#0ca898] text-white shadow-lg"><Navigation className="size-3.5 rotate-45" /></span>
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/40 bg-white/90 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">MSC Kumsal</p><p className="mt-1 text-sm font-black">En approche de Dakar</p></div><span className="rounded-full bg-teal-50 px-3 py-1.5 text-[9px] font-bold text-teal-700">12.4 kn</span></div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-200 pt-4 text-[9px]"><div><p className="text-slate-400">ETA</p><p className="mt-1 font-bold">23 sept.</p></div><div><p className="text-slate-400">Cap</p><p className="mt-1 font-bold">218°</p></div><div><p className="text-slate-400">Source</p><p className="mt-1 font-bold">AIS</p></div></div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0ca898]">Suivi maritime</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-0.045em] sm:text-5xl">Le navire sur la carte. Le dossier dans son contexte.</h2>
            <p className="mt-6 text-sm leading-7 text-[#5c6867]">La position AIS est reliée au voyage, au BL et au conteneur. Vous voyez la dernière mise à jour, l’ETA et les événements logistiques sans confondre suivi du navire et preuve de chargement.</p>
            <div className="mt-8 space-y-4">
              {[{ icon: Radar, text: "Position, vitesse, cap et dernière actualisation" }, { icon: Clock3, text: "ETA, retards et changements d'itinéraire" }, { icon: Globe2, text: "Départ, transbordements et arrivée à Dakar" }].map((item) => <div key={item.text} className="flex items-center gap-3 text-xs font-bold"><span className="grid size-9 place-items-center rounded-lg bg-[#e2f5f2] text-[#087f75]"><item.icon className="size-4" /></span>{item.text}</div>)}
            </div>
            <p className="mt-7 rounded-xl border border-[#e2c65e]/30 bg-[#fff9dd] p-4 text-[10px] leading-5 text-[#716126]">Les positions affichées dans le prototype sont simulées. Les données réelles seront activées après sélection du fournisseur AIS.</p>
          </div>
        </div>
      </section>

      <section id="securite" className="bg-[#e9c63f] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#09223e] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white"><ShieldCheck className="size-3.5" /> DevSecOps dès le départ</span>
            <h2 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-5xl">Vos dossiers restent vos dossiers.</h2>
            <p className="mt-5 text-sm leading-7 text-[#4e4a31]">Chaque entreprise dispose de son espace isolé. Les accès, les documents et les actions sensibles sont contrôlés et traçables.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[{ icon: Fingerprint, title: "Accès maîtrisés", text: "Rôles distincts pour équipes, déclarants et clients." }, { icon: LockKeyhole, title: "Données isolées", text: "Politiques RLS et séparation stricte par entreprise." }, { icon: FileText, title: "Actions tracées", text: "Journal d'audit pour les opérations sensibles." }].map((item) => <article key={item.title} className="rounded-2xl bg-[#09223e] p-6 text-white"><item.icon className="size-6 text-[#72d9ce]" /><h3 className="mt-8 text-sm font-black">{item.title}</h3><p className="mt-3 text-[10px] leading-5 text-slate-300">{item.text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="pour-qui" className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-[700px] text-center"><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0ca898]">Pensé pour le terrain</p><h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Une plateforme, plusieurs métiers.</h2></div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {audiences.map((audience) => <article key={audience.title} className="rounded-[22px] border border-[#d9d6cc] bg-white p-7"><audience.icon className="size-6 text-[#0ca898]" /><h3 className="mt-8 text-lg font-black">{audience.title}</h3><p className="mt-3 text-xs leading-6 text-[#697371]">{audience.text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="contact" className="px-5 pb-5 sm:px-8 sm:pb-8">
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-[#0ca898] px-6 py-16 text-white sm:px-14 sm:py-20">
          <div className="landing-grid absolute inset-0 opacity-10" />
          <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d0fff9]">Le prototype est en construction</p><h2 className="mt-4 max-w-[720px] text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-6xl">Construisons une logistique plus visible au Sénégal.</h2></div>
            <Link href="/dashboard" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#09223e] px-5 text-xs font-extrabold text-white transition hover:bg-[#06182a]">Voir le prototype <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#071827] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div><Brand inverse /><p className="mt-5 max-w-[380px] text-[10px] leading-5 text-slate-400">Plateforme de gestion logistique et douanière conçue au Sénégal pour les acteurs de l’import-export.</p></div>
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-[10px] font-semibold text-slate-400"><a href="#fonctionnalites" className="hover:text-white">Fonctionnalités</a><a href="#suivi" className="hover:text-white">Suivi maritime</a><a href="#securite" className="hover:text-white">Sécurité</a><Link href="/dashboard" className="hover:text-white">Prototype</Link></div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[1180px] flex-col gap-2 border-t border-white/10 pt-5 text-[8px] uppercase tracking-[0.13em] text-slate-500 sm:flex-row sm:justify-between"><span>© 2026 TransitFlow SN — Nom provisoire</span><span>Conçu pour le Sénégal · Ouvert sur le monde</span></div>
      </footer>
    </main>
  );
}
