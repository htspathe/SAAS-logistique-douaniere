# Sécurité et DevSecOps

## 1. Objectifs

- confidentialité entre entreprises ;
- intégrité des documents et événements ;
- disponibilité du service ;
- traçabilité des actions ;
- réduction du risque dès le développement.

## 2. Mesures prévues

### Identité et accès

- authentification Supabase ;
- MFA obligatoire pour les administrateurs avant la production ;
- sessions sécurisées côté serveur ;
- rôles par organisation ;
- RLS PostgreSQL sur toutes les tables contenant des données client ;
- liens du portail client limités et révocables.

### Données et documents

- TLS en transit et chiffrement du stockage fourni par l'hébergeur ;
- bucket privé et URL signées de courte durée ;
- contrôle du type, de la taille et du contenu des fichiers ;
- analyse antivirus des documents avant leur mise à disposition ;
- versionnage et empreinte cryptographique pour les pièces critiques ;
- sauvegardes et tests réguliers de restauration ;
- politique de conservation et suppression à définir.

### Application

- validation Zod aux frontières de l'application ;
- aucune clé serveur envoyée au navigateur ;
- protection contre XSS, CSRF, injections et accès direct non autorisé ;
- limitation de débit sur l'authentification, les invitations et les webhooks ;
- journal d'audit pour les connexions, téléchargements, changements de rôles et suppressions.

### Chaîne DevSecOps

- branches protégées et revue avant fusion ;
- lint, typage, tests et build dans GitHub Actions ;
- analyse de dépendances et alertes Dependabot ;
- scan de secrets ;
- scan SAST avec SonarQube ou CodeQL ;
- scan des images et fichiers avec Trivy ;
- image Docker non-root pour les services qui en ont besoin ;
- Terraform et Ansible seulement quand l'infrastructure AWS devient nécessaire.

## 3. Secrets

- `.env.local` uniquement pour le développement local ;
- secrets de production dans le gestionnaire du fournisseur ;
- rotation après exposition ou départ d'un collaborateur ;
- clé Supabase `service_role` strictement côté serveur ;
- aucune donnée sensible dans `NEXT_PUBLIC_*`.

## 4. Menaces prioritaires

1. accès d'une entreprise aux dossiers d'une autre ;
2. lien de document partagé trop largement ;
3. compte administrateur compromis ;
4. document malveillant téléversé ;
5. faux webhook maritime ou WhatsApp ;
6. fuite d'une clé d'API ;
7. modification non tracée d'un statut douanier.

## À NOTER

Le simple chiffrement de la base ne remplace pas l'isolation multi-tenant. Les politiques RLS et leurs tests négatifs sont une condition de mise en production.
