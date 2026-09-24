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
- [x] validation de l'authentification sur le projet Supabase (confirmée par l'utilisateur) ;
- [x] code de création d'organisation, propriétaire automatique et choix de l'entreprise active ;
- [x] code des rôles OWNER / ADMIN / MEMBER et paramètres d'entreprise ;
- [ ] application et validation des migrations organisation sur Supabase ;
- [ ] invitations ;
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

Étape 3 : appliquer `0003` puis `0004` sur une base de test, créer deux entreprises avec deux comptes, puis valider l'isolation RLS avec `supabase/tests/organization_rls.sql`. Le dashboard reste alimenté par des données fictives ; seuls l'entreprise active, le rôle et les membres proviennent de la base.

Ensuite : invitations et formulaire d'expédition connecté à PostgreSQL.

### À NOTER

- Ne jamais publier de clé secrète/service-role ; utiliser uniquement l'URL et la clé publique Supabase dans les variables `NEXT_PUBLIC_*`.
- Appliquer les migrations dans l'ordre après vérification de l'historique distant. La migration `0002` ajoute le profil automatique à chaque nouvelle inscription.
- Configurer l'URL du site et les URL de redirection autorisées dans Supabase avant les essais d'e-mail.
- L'authentification ne remplace pas les contrôles d'accès par entreprise : la validation RLS multi-entreprises reste à réaliser avant toute donnée réelle.
- La création initiale associe automatiquement le compte connecté au rôle OWNER dans une transaction. Les rôles métier existants sont conservés ; MEMBER est en lecture seule. Aucune autopromotion ou création de membre par l'API publique n'est permise.
- La préférence d'entreprise dans le cookie est revalidée contre les adhésions actives à chaque requête. Un compte déjà membre choisit son entreprise existante ; la création d'entreprises supplémentaires, les invitations et les transferts de propriété ne font pas partie de cet incrément.
