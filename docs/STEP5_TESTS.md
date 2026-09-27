# Étape 5 : validation des expéditions

## Préparation

Utiliser une base Supabase de test avec les migrations `0001` à `0004`, deux entreprises A/B et des comptes de test. Aucune nouvelle migration n'est nécessaire : la FK composite `(organization_id, client_id)` garantit déjà que le client appartient à l'entreprise du dossier. Ne pas utiliser de données réelles pour ces essais.

## Parcours à vérifier

1. Dans A, créer un client fictif, ouvrir Expéditions puis Nouvelle expédition. Rechercher et sélectionner ce client.
2. Créer `TEST-IMP-001` (IMPORT, FCL, douane interne), puis `TEST-EXP-001` (EXPORT, LCL, douane externe ou mixte). Le BL, le booking et les dates peuvent rester vides.
3. Vérifier liste, détail et modification. Les libellés et les données doivent rester associés à A après rechargement.
4. Saisir deux dates prévues en heures de Dakar. L'arrivée avant le départ doit être refusée, comme les dates impossibles. Un navigateur dans un autre fuseau doit conserver les heures de Dakar.
5. Essayer une référence déjà présente dans A : erreur compréhensible, formulaire conservé. La même référence est permise dans B.
6. Ouvrir un dossier dans deux onglets. Enregistrer une modification dans le premier, puis tenter une autre dans le second : l'ancienne version doit être refusée et demander un rechargement.
7. Ouvrir un formulaire dans A, changer l'entreprise active vers B dans un autre onglet, puis envoyer le formulaire : enregistrement refusé.
8. Avec MEMBER ou FINANCE, consulter les dossiers ; les boutons de création/modification ne doivent pas être proposés et les mutations doivent être refusées côté serveur.
9. Depuis A, ouvrir l'ID d'un dossier B : résultat introuvable. Désactiver une adhésion et vérifier la perte d'accès.
10. Avec plus de 20 clients, la recherche indique que les résultats doivent être affinés. Rechercher un nom au-delà des premiers résultats : il doit devenir sélectionnable. La recherche est effectuée en base, sans charger une liste tronquée à 1 000 clients.
11. Tester mobile et clavier : libellés, focus, erreurs annoncées, noms longs, sélection d'un client et tableau avec défilement horizontal.

## Tests automatisés

`npm run check` lance lint, TypeScript, tests unitaires et build. Les tests couvrent import/export, FCL/LCL, champs, dates réelles, années bissextiles, ordre chronologique, fuseau Dakar, rôles, changement d'entreprise et payloads interdits.

Sur la base de test uniquement, exécuter `supabase/tests/shipments_rls.sql` avec une connexion autorisée à changer de rôle SQL. Le script crée des fixtures puis annule la transaction. Il vérifie l'isolation, les écritures étrangères, les membres en lecture seule et la FK client/entreprise, même pour un utilisateur administrateur des deux entreprises.

## À NOTER

- Les tests SQL et les parcours avec session Supabase doivent être exécutés séparément ; le build ne les remplace pas.
- Le statut est manuel. Les dates sont des estimations saisies, sans synchronisation AIS ni tracking maritime.
- Le client est obligatoire dans les nouveaux formulaires ; les anciens dossiers sans client restent consultables.
- Les références sont normalisées en majuscules. La référence est unique par entreprise.
- La comparaison `updated_at` protège les modifications concurrentes faites par ces formulaires ; les autres futurs chemins d'écriture devront également mettre à jour cette version.
- Les données de démonstration du dashboard restent distinctes de la liste réelle des expéditions.
- Historique, documents, conteneurs, suppression et transitions de statut automatisées sont hors de cet incrément.
