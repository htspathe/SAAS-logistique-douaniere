# Vision et périmètre produit

## 1. Vision

TransitFlow SN est un SaaS B2B national de gestion logistique et douanière. Il remplace les tableaux dispersés, les documents envoyés dans plusieurs conversations et les suivis manuels par un espace unique, traçable et sécurisé.

Le père de Pathé est l'expert métier et le premier pilote. Son entreprise sert à valider les parcours réels, mais aucune règle du produit ne doit être codée uniquement pour elle.

## 2. Utilisateurs visés

- transitaires ;
- commissionnaires et déclarants en douane ;
- PME importatrices ;
- PME exportatrices ;
- équipes opérations, direction, finance et service client ;
- clients finaux invités sur un portail limité ;
- administrateurs de la plateforme.

Chaque entreprise possède un espace isolé. Un utilisateur peut appartenir à plusieurs entreprises avec un rôle différent dans chacune.

## 3. Variantes obligatoires

| Dimension | Valeurs prises en charge |
| --- | --- |
| Direction | Import, export |
| Chargement | FCL, LCL |
| Dédouanement | Interne, externe, mixte |
| Transport initial | Maritime ; aérien et routier pourront être ajoutés |
| Utilisation | Transitaire, déclarant, importateur, exportateur |

## 4. MVP

Le MVP doit permettre de :

1. créer une entreprise et inviter ses collaborateurs ;
2. créer un client et ses contacts ;
3. ouvrir un dossier d'import ou d'export ;
4. préciser FCL/LCL et le mode de dédouanement ;
5. associer un ou plusieurs conteneurs, connaissements et réservations ;
6. afficher une chronologie normalisée des événements ;
7. déposer, classer et consulter les documents autorisés ;
8. attribuer des tâches, échéances et responsables ;
9. envoyer des notifications e-mail ;
10. donner au client un accès en lecture à ses dossiers ;
11. afficher le navire, son dernier point AIS connu et son ETA lorsqu'une API est connectée ;
12. journaliser les actions sensibles.

## 5. Fonctions après le MVP

- WhatsApp Business avec modèles approuvés ;
- OCR et extraction des champs documentaires ;
- facturation et abonnements ;
- automatisation avancée des surestaries et franchises ;
- intégrations douanières officielles lorsque les accès sont disponibles ;
- application mobile ou PWA hors connexion ;
- modules aérien et routier ;
- indicateurs prédictifs de retard.

## 6. Suivi maritime

Le suivi contient deux chaînes différentes :

1. le suivi logistique du conteneur, basé sur le numéro de conteneur, le BL ou le booking et les événements du transporteur ;
2. le suivi AIS du navire, basé sur son IMO ou son MMSI.

Relation attendue :

```text
Conteneur -> BL/booking -> voyage -> navire -> IMO/MMSI -> positions AIS
```

Une position AIS ne prouve pas à elle seule qu'un conteneur précis est encore à bord. L'interface doit toujours afficher la source et l'heure de dernière mise à jour.

## 7. Principes produit

- mobile d'abord, car une partie des opérations se fait sur le terrain ;
- fonctionnement correct avec une connexion moyenne ;
- français au lancement, avec possibilité d'ajouter l'anglais ;
- dates affichées dans le fuseau `Africa/Dakar` ;
- montants en FCFA par défaut, sans bloquer les autres devises ;
- statuts communs et étapes optionnelles configurables ;
- aucune donnée réelle dans les démonstrations ou tests automatisés.

## 8. Hors périmètre immédiat

Le MVP ne transmet pas directement une déclaration aux systèmes douaniers sénégalais et ne promet pas une position temps réel sans fournisseur AIS contractuel. Ces fonctions nécessitent des accords, des API et une validation réglementaire.

## À NOTER

- Le nom « TransitFlow SN » est provisoire.
- Les données du premier pilote servent à tester le produit, pas à définir tout le marché.
- Les pièces douanières obligatoires devront être validées avec plusieurs professionnels sénégalais avant le lancement commercial.
