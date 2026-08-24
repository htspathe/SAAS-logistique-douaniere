const stats = [
  { label: "Expéditions actives", value: "24" },
  { label: "Documents à valider", value: "7" },
  { label: "Livraisons cette semaine", value: "12" }
];

const shipments = [
  { reference: "SEN-2026-001", route: "Shanghai → Dakar", status: "En douane" },
  { reference: "SEN-2026-002", route: "Istanbul → Dakar", status: "En transit" },
  { reference: "SEN-2026-003", route: "Casablanca → Dakar", status: "Documents requis" }
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">Plateforme B2B</p>
          <h1>Logistique & Douane</h1>
        </div>
        <button type="button">Nouvelle expédition</button>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Vue d'ensemble</p>
          <h2>Pilotez chaque expédition avec clarté.</h2>
          <p>Suivi, documents et notifications réunis dans un espace sécurisé.</p>
        </div>
        <span className="badge">MVP en cours</span>
      </section>

      <section className="stats" aria-label="Indicateurs">
        {stats.map((stat) => (
          <article key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panelHeading">
          <div>
            <p className="eyebrow">Opérations</p>
            <h2>Expéditions récentes</h2>
          </div>
          <a href="#">Voir toutes</a>
        </div>
        <div className="table" role="table" aria-label="Expéditions récentes">
          {shipments.map((shipment) => (
            <div className="row" role="row" key={shipment.reference}>
              <strong>{shipment.reference}</strong>
              <span>{shipment.route}</span>
              <span className="status">{shipment.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

