import Link from "next/link";

export function DossierNavigation({ shipmentId, active }: { shipmentId: string; active: string }) {
  const root = `/dashboard/expeditions/${shipmentId}`;
  return <nav aria-label="Sections du dossier" className="mb-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-200 pb-4 text-sm">
    {[["Résumé", ""], ["Conteneurs", "/conteneurs"], ["Historique", "/historique"], ["Documents", "/documents"]].map(([label, path]) => <Link key={label}
      href={`${root}${path}`} aria-current={active === label ? "page" : undefined}
      className={active === label ? "font-bold text-slate-900 underline underline-offset-8" : "font-semibold text-teal-800 hover:underline"}>{label}</Link>)}
  </nav>;
}

export function DossierPagination({ path, page, total, count }: { path: string; page: number; total: number; count: number }) {
  if (page === 1 && total <= 25) return null;
  return <nav aria-label="Pagination" className="mt-5 flex justify-between gap-4 text-sm">
    {page > 1 ? <Link href={`${path}?page=${page - 1}`} className="text-teal-800 underline">Précédent</Link> : <span />}
    <span>Page {page}</span>
    {(page - 1) * 25 + count < total && count > 0 ? <Link href={`${path}?page=${page + 1}`} className="text-teal-800 underline">Suivant</Link> : <span />}
  </nav>;
}
