# ADR-0001 — Architecture initiale

- Statut : acceptée pour le prototype
- Date : 2026-09-20

## Décision

Le prototype utilise :

- Next.js et TypeScript pour l'interface et les routes serveur ;
- PostgreSQL, Auth et Storage via Supabase ;
- Vercel pour une première mise en ligne ;
- un adaptateur par service externe : maritime, e-mail et WhatsApp ;
- Python/FastAPI uniquement lorsqu'un besoin de traitement long, OCR ou calcul spécialisé apparaît.

## Raisons

Cette architecture permet de livrer rapidement un MVP complet sans maintenir immédiatement plusieurs serveurs. TypeScript apporte des contrats communs entre l'interface et le serveur. PostgreSQL et RLS fournissent une base solide pour un produit multi-entreprises.

## Conséquences

- le premier code reste dans une seule application ;
- les secrets et appels fournisseurs restent côté serveur ;
- la base contient `organization_id` sur chaque ressource métier ;
- les intégrations ne doivent pas être appelées directement depuis les composants d'interface ;
- AWS, Terraform et Ansible sont repoussés jusqu'à ce que les besoins de charge ou de conformité le justifient.

## À NOTER

Cette décision n'interdit pas une évolution vers des services séparés. Elle évite simplement une architecture trop complexe avant d'avoir validé les usages et les premiers clients.
