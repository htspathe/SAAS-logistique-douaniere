# TransitFlow SN

> Nom de travail : le nom commercial définitif reste à valider.

Plateforme SaaS multi-entreprises destinée aux transitaires, déclarants en douane et PME importatrices ou exportatrices du Sénégal.

Le produit centralise les dossiers d'expédition, les conteneurs, les documents, le dédouanement, les notifications et le suivi maritime. Il couvre l'import comme l'export, le FCL comme le LCL, ainsi que le dédouanement interne, externe ou mixte.

## État actuel

- socle Next.js 16, React 19 et TypeScript strict ;
- site vitrine original et responsive sur `/` ;
- première maquette responsive du tableau de bord ;
- modèle métier national documenté ;
- première migration PostgreSQL/Supabase avec isolation multi-tenant ;
- principes DevSecOps et feuille de route initiale.

Les chiffres et expéditions visibles dans l'interface sont des données de démonstration.

## Démarrage local

Prérequis : Node.js 20.9 ou supérieur.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

- site vitrine : [http://localhost:3000](http://localhost:3000) ;
- prototype du tableau de bord : [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Vérifications

```bash
npm run lint
npm run build
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
