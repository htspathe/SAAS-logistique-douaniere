# Feuille de route

## Phase 0 — Cadrage et socle

- [x] définir la cible nationale ;
- [x] couvrir import/export, FCL/LCL et douane interne/externe/mixte ;
- [x] choisir Next.js, TypeScript, Supabase et PostgreSQL ;
- [x] initialiser l'application ;
- [x] créer le site vitrine original et séparer le dashboard ;
- [x] définir une première hypothèse de monétisation ;
- [x] documenter le modèle métier et la sécurité ;
- [ ] valider le parcours avec au moins trois profils métier différents.

## Phase 1 — Dossiers et organisations

- [x] code d'authentification (inscription, connexion, confirmation, déconnexion et dashboard protégé) ;
- [ ] validation de bout en bout sur le projet Supabase configuré ;
- [ ] création d'organisation et invitations ;
- [ ] rôles et politiques RLS testées ;
- [ ] clients et contacts ;
- [ ] création et modification d'expéditions ;
- [ ] conteneurs, BL et bookings ;
- [ ] historique des événements.

## Phase 2 — Documents et portail client

- [ ] coffre-fort privé ;
- [ ] catégories, versions et validation ;
- [ ] partage contrôlé ;
- [ ] portail client ;
- [ ] journal des téléchargements.

## Phase 3 — Notifications et opérations

- [ ] tâches et échéances ;
- [ ] e-mails transactionnels ;
- [ ] modèles de notification ;
- [ ] alertes d'arrivée, document manquant et délai douanier ;
- [ ] WhatsApp Business après validation du fournisseur.

## Phase 4 — Suivi maritime

- [ ] interface fournisseur maritime ;
- [ ] liaison conteneur/BL/voyage/navire ;
- [ ] positions AIS horodatées ;
- [ ] carte et ETA ;
- [ ] alertes d'approche et de changement ;
- [ ] contrôle des quotas et du coût de l'API.

## Phase 5 — Industrialisation

- [ ] abonnement par volume ;
- [ ] observabilité et alertes ;
- [ ] tests de charge et de restauration ;
- [ ] audit de sécurité ;
- [ ] pilote multi-entreprises ;
- [ ] lancement commercial au Sénégal.

## Prochaine livraison

Étape 2 : configurer Supabase et valider un cycle inscription → confirmation par e-mail → connexion → déconnexion. Le dashboard reste alimenté par des données fictives.

Ensuite : création d'organisation, invitations, tests d'isolation entre entreprises puis formulaire d'expédition connecté à PostgreSQL.

### À NOTER

- Ne jamais publier de clé secrète/service-role ; utiliser uniquement l'URL et la clé publique Supabase dans les variables `NEXT_PUBLIC_*`.
- Appliquer les migrations dans l'ordre après vérification de l'historique distant. La migration `0002` ajoute le profil automatique à chaque nouvelle inscription.
- Configurer l'URL du site et les URL de redirection autorisées dans Supabase avant les essais d'e-mail.
- L'authentification ne remplace pas les contrôles d'accès par entreprise : la validation RLS multi-entreprises reste à réaliser avant toute donnée réelle.
