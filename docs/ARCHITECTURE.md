# Architecture du MVP

## Vue générale

1. **Next.js** fournit l'interface, les routes serveur et les contrôles d'accès.
2. **Supabase Auth** authentifie les utilisateurs.
3. **PostgreSQL** stocke les organisations, utilisateurs, expéditions et documents.
4. **Supabase Storage** conserve les fichiers avec des règles d'accès par organisation.
5. Des services externes enverront les notifications e-mail et WhatsApp.

## Modèle multi-tenant

Chaque donnée métier possède un `organization_id`. Les politiques Row Level Security de PostgreSQL doivent empêcher un utilisateur de lire ou modifier les données d'une autre organisation.

## Rôles prévus

- `admin` : administration de l'organisation et des utilisateurs ;
- `operator` : création et mise à jour des expéditions ;
- `client` : consultation des expéditions et documents autorisés.

## Principes de sécurité

- authentification obligatoire pour les zones privées ;
- contrôle d'accès côté serveur et dans PostgreSQL ;
- fichiers privés avec URLs temporaires ;
- validation stricte des entrées ;
- secrets uniquement dans les variables d'environnement ;
- journalisation des opérations sensibles ;
- analyse des dépendances et des images dans la CI.

