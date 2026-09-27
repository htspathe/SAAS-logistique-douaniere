# Étapes 6 et 7 : conteneurs, historique et documents privés

## État et périmètre

Les écrans utilisent l'entreprise active et un dossier existant. OWNER, ADMIN, OPERATIONS et CUSTOMS_AGENT peuvent écrire ; MEMBER et FINANCE consultent. Aucun portail client n'est activé.

- Conteneurs : numéro facultatif avant attribution, format ISO 6346 et clé de contrôle vérifiés s'il est renseigné ; scellé et type facultatifs.
- Historique : événements manuels horodatés en heure de Dakar, ajout uniquement. Une correction passe par un nouvel événement. Aucun changement automatique du statut du dossier.
- Documents : PDF/JPEG/PNG de 10 Mio maximum, métadonnées, empreinte SHA-256, stockage privé et téléchargement en pièce jointe par URL signée valable 60 secondes.

## Vérifier avant les migrations

Le dépôt peut déjà être connecté à Supabase avec le déploiement automatique activé. Vérifier d'abord l'historique des migrations dans le projet et les journaux de l'intégration GitHub. Ne pas lancer manuellement une migration déjà appliquée ou en cours par l'intégration.

Sur une base de test où `0001` à `0004` sont appliquées, appliquer une seule fois, dans l'ordre :

1. `0005_containers_manual_events.sql` : validation ISO, permissions conteneurs et événements append-only.
2. `0006_private_shipment_documents.sql` : état PENDING/READY, bucket privé `shipment-documents`, politiques de métadonnées et Storage.

Ces migrations créent des contraintes, politiques et un bucket et ne sont pas réexécutables telles quelles. Si le bucket existe déjà, examiner sa provenance et ses politiques avant de poursuivre ; la migration refuse de le remplacer silencieusement. Examiner également les politiques générales de `storage.objects` : une ancienne politique permissive visant tous les buckets peut élargir les accès attendus.

Les contraintes ajoutées `NOT VALID` préservent les anciennes lignes mais contrôlent les écritures nouvelles. Les anciens documents passent en PENDING ; il faut les examiner et les réconcilier avant de les considérer prêts. Ne pas valider en masse des lignes sans vérifier leur objet réel.

### Vérification SQL en lecture seule après migration

Une exécution manuelle dans SQL Editor n'enregistre pas forcément la migration dans `supabase_migrations`, et cette table peut être absente. L'absence de `0005` ou `0006` dans cet historique ne prouve donc pas que la migration n'a pas été appliquée : vérifier aussi les structures, le bucket et les politiques avant toute exécution.

```sql
select version from supabase_migrations.schema_migrations
where version in ('0005', '0006') order by version;

select id, public, file_size_limit, allowed_mime_types
from storage.buckets where id = 'shipment-documents';

select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'documents'
  and column_name = 'upload_state';

select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where (schemaname = 'storage' and tablename = 'objects')
   or (schemaname = 'public' and tablename in ('documents','containers','tracking_events'))
order by schemaname, tablename, policyname;
```

Valeurs attendues du bucket : privé, limite `10485760`, MIME PDF/JPEG/PNG. Vérifier l'absence de politiques Storage plus larges permettant la lecture publique, l'écrasement ou la suppression des objets prêts.

## Parcours de test avec des données fictives

1. Ouvrir un dossier A, ajouter un conteneur sans numéro puis le modifier avec `CSQU3054383`. Une clé différente doit être refusée.
2. Vérifier que le dossier B d'une autre entreprise ne peut pas être utilisé pour rattacher le conteneur, y compris avec un utilisateur membre des deux entreprises.
3. Ajouter un événement avec code, description, lieu et heure Dakar. Il doit apparaître dans l'ordre chronologique. Une date impossible doit être refusée.
4. Vérifier qu'aucun rôle applicatif, même OWNER, ne peut modifier ou supprimer un événement via l'API.
5. Avec un fichier de test bénin, essayer chaque format accepté. Vérifier liste, catégorie, taille et téléchargement. Un changement d'extension/MIME sans changement de contenu doit être refusé.
6. Essayer fichier vide, format interdit et fichier au-delà de 10 Mio. Le formulaire doit afficher une erreur ; le fichier devra être sélectionné à nouveau si nécessaire.
7. Vérifier que le stockage est privé sans URL signée et qu'un lien de téléchargement expire après 60 secondes. Le lien doit télécharger une pièce jointe, sans affichage intégré dans l'application.
8. Simuler une panne après préparation des métadonnées ou après upload : le transfert PENDING reste identifiable. Le bouton « Annuler le transfert » doit retirer l'objet avant la ligne de métadonnées. Il est réservé à son auteur ayant encore les droits d'écriture.
9. Un membre en lecture seule peut télécharger un document READY, mais ne peut ni uploader ni annuler un transfert. Un membre d'une autre entreprise ne peut lire ni métadonnées ni objet.
10. Vérifier qu'un document READY ne peut être remis en PENDING, écrasé, déplacé, réattribué à un autre uploader ou supprimé via les droits applicatifs.
11. Ouvrir un formulaire dans A puis changer d'entreprise dans un autre onglet : l'enregistrement doit être refusé.
12. Vérifier mobile, clavier, noms longs, libellés, erreurs annoncées et absence de débordements. La revue visuelle automatisée n'a pas pu être exécutée dans cet environnement.

## Tests automatisés et limites

`npm run check` couvre lint, typage, tests unitaires et build. Les fixtures de fichiers des tests restent des signatures synthétiques en mémoire, aucun document réel n'est conservé.

`supabase/tests/dossier_documents_rls.sql` crée des fixtures puis annule la transaction. Les migrations et suites SQL ont été exécutées localement sur PostgreSQL via PGlite avec un schéma Auth/Storage minimal. Cela vérifie les contraintes, permissions et politiques RLS, mais **pas** les API HTTP Supabase, la génération/expiration des URL signées, le contenu du stockage objet ou le déploiement réel. Ces essais doivent être faits sur la base de test configurée.

## À NOTER

- Les signatures de fichiers, MIME et extensions sont contrôlés par l'application, sans analyse antivirus ni validation complète du contenu. Un utilisateur autorisé utilisant directement les API peut contourner cette validation applicative ; le bucket impose MIME/taille et les politiques imposent les accès. Ne pas qualifier les documents d'analysés ou garantis sans contenu malveillant.
- L'URL signée est un lien porteur d'autorisation jusqu'à son expiration. Une déconnexion ne révoque pas instantanément un lien déjà émis.
- L'auteur ayant les droits opérations peut lire son propre objet PENDING pour permettre la récupération via l'API Storage. L'application ne propose le téléchargement normal qu'une fois READY.
- Les transferts interrompus sont suivis par leurs métadonnées PENDING. Aucun nettoyage automatique n'est installé. Si l'auteur perd ses droits, un administrateur technique doit réconcilier le stockage et les métadonnées via une procédure contrôlée.
- L'application accepte un corps de Server Action de 12 Mio pour un fichier de 10 Mio et son enveloppe multipart. Vérifier la limite réelle de l'hébergement/proxy avant déploiement ; la configuration Next.js ne relève pas les limites imposées par un fournisseur.
- Les versions de documents, partage client, suppression de documents prêts, scan antivirus et automatisation maritime restent hors de ces étapes.
