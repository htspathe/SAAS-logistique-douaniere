# TransitFlow SN

> Nom de travail : le nom commercial définitif reste à valider.

Plateforme SaaS multi-entreprises destinée aux transitaires, déclarants en douane et PME importatrices ou exportatrices du Sénégal.

Le produit centralise les dossiers d'expédition, les conteneurs, les documents, le dédouanement, les notifications et le suivi maritime. Il couvre l'import comme l'export, le FCL comme le LCL, ainsi que le dédouanement interne, externe ou mixte.

## État actuel (16 octobre 2026)

- Next.js 16, React 19, TypeScript strict et Supabase/PostgreSQL ;
- vitrine responsive, connexion et inscription ;
- organisations, rôles et isolation multi-entreprises conçue autour des politiques RLS ;
- gestion des clients, expéditions import/export, conteneurs et événements manuels append-only ;
- documents privés (upload PDF/JPEG/PNG, empreinte SHA-256, téléchargement signé) ;
- page d'accueil du tableau de bord : compteurs et 5 dernières expéditions issus des données de l'entreprise active ;
- carte maritime AIS, alertes et journal de la page d'accueil **encore simulés**.

**Statut : MVP en développement, non validé pour des données clients réelles.**
Les migrations 0005/0006, les scénarios multi-entreprises en conditions Supabase réelles et les URL signées doivent être vérifiés avant tout pilote. Ne pas considérer le dashboard comme une source de positions AIS ni de notifications réellement envoyées.

Voir [l'état détaillé et la checklist de validation](docs/STATUS_2026-10-16.md), puis [les tests des étapes 6 et 7](docs/STEP6_7_TESTS.md).

## Démarrage local

Prérequis : Node.js 20.9 ou supérieur.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

- site vitrine : [http://localhost:3000](http://localhost:3000) ;
- tableau de bord (session et organisation requises) : [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Vérifications

```bash
npm run check
```

## Documentation

- [Vision et périmètre produit](docs/PRODUCT.md)
- [Modèle métier](docs/DOMAIN_MODEL.md)
- [Sécurité](docs/SECURITY.md)
- [Direction artistique](docs/DESIGN.md)
- [Modèle économique](docs/BUSINESS_MODEL.md)
- [Feuille de route](docs/ROADMAP.md)
- [Décision d'architecture](docs/adr/0001-architecture.md)

## Règle sur les notes

Les décisions utiles à toute l'équipe sont versionnées dans `docs/`. Les secrets, brouillons et notes privées vont dans `PROJECT_NOTES.local.md`, volontairement ignoré par Git. Aucun mot de passe, jeton API ou document client réel ne doit être envoyé sur GitHub.
