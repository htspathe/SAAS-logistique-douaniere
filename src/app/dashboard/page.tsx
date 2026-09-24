import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Anchor,
  ArrowRight,
  Bell,
  Boxes,
  CalendarClock,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Container,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Ship,
  UsersRound,
} from "lucide-react";
import { demoShipments } from "@/data/demo";
import type { ShipmentPhase } from "@/lib/domain";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Prototype du cockpit opérationnel TransitFlow SN.",
};

const navItems = [
  { label: "Vue d'ensemble", icon: LayoutDashboard, active: true },
  { label: "Expéditions", icon: Container },
  { label: "Trafic maritime", icon: Ship },
  { label: "Documents", icon: FileText, badge: "7" },
  { label: "Clients", icon: UsersRound },
];

const stats: Array<{
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  iconClass: string;
}> = [
  {
    label: "Dossiers actifs",
    value: "24",
    note: "+4 ce mois",
    icon: Boxes,
    iconClass: "bg-slate-100 text-slate-700",
  },
  {
    label: "Conteneurs en mer",
    value: "11",
    note: "3 arrivent cette semaine",
    icon: Ship,
    iconClass: "bg-blue-50 text-blue-700",
  },
  {
    label: "En dédouanement",
    value: "5",
    note: "2 pièces attendues",
    icon: FileCheck2,
    iconClass: "bg-amber-50 text-amber-700",
  },
  {
    label: "Alertes à traiter",
    value: "3",
    note: "1 alerte prioritaire",
    icon: AlertTriangle,
    iconClass: "bg-red-50 text-red-600",
  },
];

const phaseStyles: Record<ShipmentPhase, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PREPARATION: "bg-slate-100 text-slate-700",
  BOOKED: "bg-indigo-50 text-indigo-700",
  ORIGIN: "bg-violet-50 text-violet-700",
  IN_TRANSIT: "bg-blue-50 text-blue-700",
  ARRIVED: "bg-cyan-50 text-cyan-700",
  CUSTOMS: "bg-amber-50 text-amber-800",
  DELIVERY: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  ON_HOLD: "bg-red-50 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

function Sidebar({ displayName }: { displayName: string }) {
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col bg-[#09223e] px-4 py-5 text-white lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2" aria-label="Retour au site TransitFlow SN">
        <div className="grid size-10 place-items-center rounded-xl bg-[#13b8a6] shadow-lg shadow-teal-950/20">
          <Anchor className="size-5" strokeWidth={2.4} />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-tight">TransitFlow</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-300">
            Sénégal
          </p>
        </div>
      </Link>

      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Pilotage
      </p>
      <nav className="space-y-1" aria-label="Navigation principale">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                item.active
                  ? "bg-white/11 text-white"
                  : "text-slate-300 hover:bg-white/7 hover:text-white"
              }`}
            >
              <Icon className="size-[18px]" strokeWidth={1.8} />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-teal-400/18 px-2 py-0.5 text-[10px] text-teal-200">
                  {item.badge}
                </span>
              ) : null}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-slate-300 hover:bg-white/7 hover:text-white"
        >
          <Settings className="size-[18px]" strokeWidth={1.8} />
          Paramètres
        </a>
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/6 p-3">
          <div className="grid size-9 place-items-center rounded-full bg-teal-500 text-xs font-bold">
            <CircleUserRound className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{displayName}</p>
            <p className="truncate text-[10px] text-slate-400">Compte connecté</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header({ email }: { email: string }) {
  return (
    <header className="flex h-[72px] items-center gap-4 border-b border-slate-200/80 bg-white px-4 sm:px-7">
      <button
        type="button"
        className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </button>
      <div className="relative hidden max-w-[360px] flex-1 sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          aria-label="Rechercher"
          placeholder="Rechercher un dossier, client ou conteneur"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-10 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
        />
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-800 md:inline-flex">
          Données de démonstration
        </span>
        <button
          type="button"
          className="relative grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <div
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-slate-700 sm:px-3"
        >
          <CircleUserRound className="size-5 text-slate-500" />
          <span className="hidden max-w-44 truncate text-xs font-semibold sm:inline" title={email}>{email}</span>
        </div>
        <form action={signOut}>
          <button type="submit" className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" aria-label="Se déconnecter">
            <LogOut className="size-4" />
            <span className="hidden xl:inline">Déconnexion</span>
          </button>
        </form>
      </div>
    </header>
  );
}

function Stats() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article
            key={stat.label}
            className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[#102a43]">{stat.value}</p>
              </div>
              <div className={`grid size-9 place-items-center rounded-lg ${stat.iconClass}`}>
                <Icon className="size-[18px]" strokeWidth={1.9} />
              </div>
            </div>
            <p className="mt-3 text-[10px] text-slate-400">{stat.note}</p>
          </article>
        );
      })}
    </section>
  );
}

function ShipmentsTable() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-sm font-bold text-[#102a43]">Expéditions récentes</h2>
          <p className="mt-0.5 text-[10px] text-slate-400">Tous les modes de traitement réunis</p>
        </div>
        <a href="#" className="flex items-center gap-1 text-[11px] font-semibold text-teal-700">
          Tout afficher <ArrowRight className="size-3.5" />
        </a>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/70 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-5 py-3">Dossier</th>
              <th className="px-4 py-3">Trajet</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Échéance</th>
              <th className="px-4 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {demoShipments.map((shipment) => (
              <tr key={shipment.id} className="group text-[11px] hover:bg-slate-50/50">
                <td className="px-5 py-4">
                  <p className="font-bold text-[#17324d]">{shipment.reference}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{shipment.client}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-700">{shipment.route}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {shipment.containerNumber ?? "Conteneur à confirmer"}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-700">
                    {shipment.direction === "IMPORT" ? "Import" : "Export"}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">{shipment.loadType}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold ${phaseStyles[shipment.phase]}`}>
                    {shipment.statusLabel}
                  </span>
                  <div className="mt-2 h-1 w-20 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${shipment.progress}%` }} />
                  </div>
                </td>
                <td className="px-4 py-4 text-[10px] font-medium text-slate-600">{shipment.eta}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    aria-label={`Actions pour ${shipment.reference}`}
                    className="grid size-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {demoShipments.map((shipment) => (
          <article key={shipment.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#17324d]">{shipment.reference}</p>
                <p className="mt-1 text-[10px] text-slate-400">{shipment.client}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${phaseStyles[shipment.phase]}`}>
                {shipment.statusLabel}
              </span>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-700">{shipment.route}</p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span>{shipment.direction === "IMPORT" ? "Import" : "Export"} · {shipment.loadType}</span>
              <span>{shipment.eta}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MaritimeTraffic() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-[#102a43]">Trafic maritime</h2>
          <p className="mt-0.5 text-[10px] text-slate-400">Zone du port de Dakar · simulation</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500" /> AIS prêt
        </span>
      </div>
      <div className="relative mx-4 h-[238px] overflow-hidden rounded-xl bg-[#dff3f5]">
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(40,120,130,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(40,120,130,.12)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute -left-14 -top-8 h-[310px] w-[135px] rotate-[-8deg] rounded-[48%] bg-[#d8c9a6] shadow-[10px_0_24px_rgba(24,93,104,0.12)]" />
        <div className="absolute left-5 top-1/2 z-10 -translate-y-1/2">
          <div className="flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[9px] font-bold text-[#17324d] shadow-sm">
            <MapPinned className="size-3 text-teal-600" /> Dakar
          </div>
        </div>
        <div className="absolute left-[46%] top-[31%]">
          <span className="absolute -inset-3 animate-pulse rounded-full bg-teal-500/15" />
          <div className="relative grid size-8 place-items-center rounded-full bg-[#0ca898] text-white shadow-lg shadow-teal-900/20">
            <Ship className="size-4 rotate-[-18deg]" />
          </div>
          <div className="absolute left-7 top-6 w-max rounded-md bg-[#102a43] px-2 py-1 text-[8px] font-semibold text-white shadow-lg">
            MSC KUMSAL · 12.4 kn
          </div>
        </div>
        <div className="absolute left-[73%] top-[62%] grid size-6 place-items-center rounded-full bg-blue-600 text-white shadow-md">
          <Ship className="size-3 rotate-[12deg]" />
        </div>
        <div className="absolute left-[64%] top-[19%] grid size-5 place-items-center rounded-full bg-slate-500 text-white shadow-md">
          <Ship className="size-2.5 rotate-[28deg]" />
        </div>
        <div className="absolute bottom-3 right-3 rounded-md bg-white/90 px-2 py-1.5 text-[8px] font-medium text-slate-500 shadow-sm backdrop-blur">
          Dernière mise à jour : données simulées
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-100 px-2 py-4 text-center">
        {[
          ["8", "En approche"],
          ["5", "À quai"],
          ["2", "Avec retard"],
        ].map(([value, label]) => (
          <div key={label}>
            <p className="text-sm font-bold text-[#17324d]">{value}</p>
            <p className="mt-0.5 text-[8px] uppercase tracking-wide text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BottomPanels() {
  const actions = [
    {
      title: "Facture commerciale manquante",
      detail: "SN-IMP-0038 · requise pour le dossier douanier",
      label: "Urgent",
      Icon: AlertTriangle,
      wrap: "border-red-100 bg-red-50/60",
      icon: "bg-red-100 text-red-600",
      text: "text-red-600",
    },
    {
      title: "Franchise portuaire dans 48 heures",
      detail: "SN-IMP-0029 · confirmer la date de sortie",
      label: "À suivre",
      Icon: Clock3,
      wrap: "border-amber-100 bg-amber-50/60",
      icon: "bg-amber-100 text-amber-700",
      text: "text-amber-700",
    },
    {
      title: "Mainlevée enregistrée",
      detail: "SN-IMP-0034 · livraison à programmer",
      label: "Terminé",
      Icon: CheckCircle2,
      wrap: "border-emerald-100 bg-emerald-50/50",
      icon: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-700",
    },
  ];

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#102a43]">Actions prioritaires</h2>
            <p className="mt-0.5 text-[10px] text-slate-400">Échéances et anomalies à traiter</p>
          </div>
          <CalendarClock className="size-5 text-slate-400" />
        </div>
        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.title} className={`flex items-center gap-3 rounded-lg border p-3 ${action.wrap}`}>
              <div className={`grid size-8 place-items-center rounded-lg ${action.icon}`}>
                <action.Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-slate-700">{action.title}</p>
                <p className="mt-0.5 text-[9px] text-slate-400">{action.detail}</p>
              </div>
              <span className={`text-[9px] font-bold ${action.text}`}>{action.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#102a43]">Activité récente</h2>
            <p className="mt-0.5 text-[10px] text-slate-400">Événements opérationnels et documents</p>
          </div>
          <a href="#" className="text-[10px] font-semibold text-teal-700">Voir le journal</a>
        </div>
        <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-slate-200">
          <TimelineItem icon={Ship} color="bg-blue-50 text-blue-700" title="Le navire a quitté Las Palmas" detail="SN-IMP-0042 · il y a 32 minutes" />
          <TimelineItem icon={FileText} color="bg-violet-50 text-violet-700" title="Bill of Lading validé" detail="SN-EXP-0031 · par Fatou Ndiaye · il y a 2 h" />
          <TimelineItem icon={Bell} color="bg-emerald-50 text-emerald-700" title="Notification d'arrivée envoyée" detail="SN-IMP-0038 · e-mail · il y a 4 h" />
        </ol>
      </section>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  color,
  title,
  detail,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  detail: string;
}) {
  return (
    <li className="relative flex gap-3">
      <div className={`z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-white ${color}`}>
        <Icon className="size-3.5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-700">{title}</p>
        <p className="mt-1 text-[9px] text-slate-400">{detail}</p>
      </div>
    </li>
  );
}

export default async function DashboardPage() {
  // The proxy refreshes cookies; the page independently checks authentication.
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) redirect("/auth/connexion");

  const email = typeof data.claims.email === "string" ? data.claims.email : "Mon compte";
  const fullName: unknown = data.claims.user_metadata?.full_name;
  const displayName = typeof fullName === "string" && fullName.trim()
    ? fullName.trim().slice(0, 100)
    : email;
  const today = new Intl.DateTimeFormat("fr-SN", {
    dateStyle: "long",
    timeZone: "Africa/Dakar",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#182230]">
      <div className="flex min-h-screen">
        <Sidebar displayName={displayName} />
        <section className="min-w-0 flex-1">
          <Header email={email} />
          <div className="mx-auto max-w-[1460px] p-4 sm:p-7">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-md bg-teal-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-teal-700">
                    Prototype MVP
                  </span>
                  <span className="text-[11px] text-slate-400">{today}</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#102a43] sm:text-[28px]">
                  Bonjour {displayName}, bienvenue
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Aperçu avec données fictives. Vos dossiers réels seront disponibles à la prochaine étape.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0ca898] px-4 text-xs font-semibold text-white shadow-sm shadow-teal-900/10 transition hover:bg-[#098f82]"
              >
                <Plus className="size-4" /> Nouvelle expédition
              </button>
            </div>
            <Stats />
            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
              <ShipmentsTable />
              <MaritimeTraffic />
            </div>
            <BottomPanels />
          </div>
        </section>
      </div>
    </main>
  );
}
