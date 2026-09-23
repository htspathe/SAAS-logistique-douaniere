# Modèle métier initial

## 1. Entités principales

| Entité | Rôle |
| --- | --- |
| Organisation | Entreprise abonnée et frontière d'isolation des données |
| Utilisateur | Personne authentifiée |
| Membre | Lien entre un utilisateur, une organisation et un rôle |
| Client | Importateur, exportateur ou donneur d'ordre géré par l'organisation |
| Expédition | Dossier logistique principal |
| Conteneur | Unité FCL/LCL éventuellement associée à plusieurs références |
| Dossier douanier | État du dédouanement et intervenant responsable |
| Document | Fichier, catégorie, version, visibilité et statut de validation |
| Navire | Identité maritime : nom, IMO, MMSI |
| Étape de voyage | Port de départ, transbordement ou arrivée et horaires |
| Événement | Fait horodaté provenant d'un utilisateur ou d'une API |
| Notification | Message e-mail, WhatsApp ou interne et état d'envoi |
| Journal d'audit | Trace immuable des opérations sensibles |

## 2. Champs structurants d'une expédition

```text
direction     = IMPORT | EXPORT
load_type     = FCL | LCL
customs_mode  = INTERNAL | EXTERNAL | MIXED
transport     = SEA
phase         = DRAFT | PREPARATION | BOOKED | ORIGIN | IN_TRANSIT |
                ARRIVED | CUSTOMS | DELIVERY | COMPLETED | ON_HOLD | CANCELLED
```

Des événements détaillés complètent la phase générale. Cette séparation évite de créer un statut différent pour chaque entreprise tout en conservant la précision opérationnelle.

## 3. Parcours import maritime

1. création du dossier et collecte des références ;
2. récupération des pièces d'origine ;
3. réservation et départ ;
4. trajet maritime et éventuels transbordements ;
5. pré-arrivée et préparation douanière ;
6. arrivée, déchargement et disponibilité ;
7. déclaration, contrôle éventuel, liquidation et mainlevée ;
8. sortie portuaire ;
9. livraison ;
10. clôture et archivage.

Pour le LCL, les étapes consolidation et dégroupage peuvent être ajoutées. Pour un déclarant externe, les tâches douanières sont attribuées à un partenaire et leurs preuves restent visibles.

## 4. Parcours export maritime

1. création du dossier et demande de booking ;
2. collecte documentaire et préparation de la marchandise ;
3. empotage FCL ou consolidation LCL ;
4. entrée au terminal ;
5. formalités douanières ;
6. chargement et départ ;
7. trajet et transbordements ;
8. arrivée à destination ;
9. confirmation de livraison ;
10. clôture et archivage.

## 5. Rôles initiaux

| Rôle | Principaux droits |
| --- | --- |
| Propriétaire | Paramètres, abonnement, membres et toutes les données de l'entreprise |
| Administrateur | Membres, clients, dossiers, documents et intégrations |
| Opérations | Dossiers, conteneurs, événements, tâches et documents |
| Déclarant | Dossiers douaniers et documents autorisés |
| Finance | Coûts, facturation et vues financières futures |
| Client | Accès portail séparé, limité à ses dossiers et documents partagés |

Le principe du moindre privilège s'applique. Un client n'est pas un membre interne de l'organisation : son accès passe par une association distincte au portail. Les droits précis seront testés dans PostgreSQL au moyen de politiques RLS.

## 6. Documents initiaux

- connaissement maritime (Bill of Lading) ;
- facture commerciale ou proforma ;
- liste de colisage ;
- certificat d'origine ;
- police ou certificat d'assurance ;
- déclaration douanière ;
- bon à délivrer ;
- ordre de transit ou mandat ;
- justificatifs de paiement ;
- preuves de livraison.

Cette liste est configurable, car les exigences changent selon la marchandise, le régime, le pays d'origine et l'opération.

## À NOTER

Le numéro de conteneur doit être validé selon son format, mais un dossier LCL peut exister avant de connaître le conteneur consolidé. Le modèle ne doit donc pas rendre ce numéro obligatoire à la création.
