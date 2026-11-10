# TransitFlow SN | Étude stratégique exécutive et plan de validation

**Date de vérification : 10 novembre 2026.**  
**Statut : recherche documentaire et audit statique du dépôt effectués ; entretiens, test de production, devis et validation juridique non réalisés.**

Ce document répond au cahier des charges de recherche du projet. Les termes **CONFIRMÉ**, **HYPOTHÈSE**, **À TESTER** et **HORS MVP** sont utilisés volontairement. Les faits externes sont accompagnés de liens sources, et les choix produit sont des recommandations, non des résultats d'enquête.

## 1. Résumé exécutif

**Décision proposée :** faire de TransitFlow SN un *outil de coordination des dossiers, documents, responsabilités et échéances des transitaires et PME import-export au Sénégal*, sans promettre de remplacer la Douane ou les systèmes du Port de Dakar.

- **CONFIRMÉ :** les démarches sont déjà en cours de dématérialisation via les systèmes officiels, notamment GAINDE/ORBUS et le chantier des Bons à Délivrer électroniques au Port autonome de Dakar.
- **CONFIRMÉ :** le dépôt contient une application opérationnelle au niveau du code, mais le projet Supabase lié au dépôt est actuellement **INACTIVE**, et les tests RLS/Storage avec plusieurs entreprises réelles n'ont pas été validés.
- **CONFIRMÉ :** des concurrents proposent déjà la gestion de fret, les documents, la facturation, les portails et/ou des données maritimes. La différenciation locale doit être prouvée.
- **HYPOTHÈSE :** les premiers gains se situent dans la recherche documentaire, le suivi des actions, la réduction des relances et la prévention des oublis d'échéance.
- **À TESTER :** marché adressable, prix 25 000/60 000/150 000 FCFA par mois, couverture maritime, coûts variables, acceptation du produit par les opérateurs.

**Trois prochains jalons bloquants :** remettre Supabase accessible ; tester RLS + documents sur deux organisations ; valider le workflow import/export avec au moins trois profils métiers indépendants.

## 2. Produit, utilisateurs et proposition de valeur

Segments : transitaire/commissionnaire agréé, déclarant, opérateur de transit, PME importatrice/exportatrice, direction, finance, client invité et administrateur SaaS. Ne pas confondre le rôle logiciel « déclarant » avec une habilitation douanière.

Proposition de valeur testable : « Ouvrez un dossier, retrouvez ses pièces et sa prochaine action, et partagez un avancement fiable avec les personnes autorisées. »

Un dossier dispose d'un responsable, d'une direction import/export, d'une catégorie FCL/LCL, d'un mode douane interne/externe/mixte, de références BL/booking, de documents, de jalons, d'un historique immuable des événements validés et, plus tard, de coûts.

Les clients finaux du transitaire ne deviennent pas automatiquement membres de l'organisation : prévoir un modèle de partage distinct et révocable.

## 3. Audit du dépôt GitHub, état du 10 novembre

Dépôt : https://github.com/htspathe/SAAS-logistique-douaniere ; branche main, commit de référence 45f3c30b3f6fb7b7f70c2ea34e879b3ddad97be1. **Visibilité : PUBLIC.**

| Zone | Présent dans le code | Limite constatée |
| --- | --- | --- |
| Front | Next.js 16, React 19, TS, Tailwind 4 | Revue UX intégrale non effectuée |
| Auth | Inscription/connexion, sessions SSR, profil | Tests réels de déconnexion/session à confirmer |
| Entreprises | Organisations et rôles, membership et RLS dans migrations | RLS distant non testé avec deux entreprises |
| Clients | Liste, création et modification | Contacts multiples non implémentés |
| Expéditions | Import/export, FCL/LCL, détail et modification | Parcours métier terrain non validé |
| Conteneurs | Référence optionnelle, scellé, type | Migration 0005 non confirmée à distance |
| Événements | Ajout manuel append-only | Source AIS absente |
| Documents | PDF/JPEG/PNG, SHA-256, URL signée, bucket privé | Migration 0006, Storage, antivirus, récupération à tester |
| Dashboard | Compteurs et cinq expéditions de l'entreprise active | Carte et alertes simulées |
| Automatisations | CI GitHub : lint, typage, tests, build, npm audit prod | Pas un audit complet de sécurité |
| Design | 20 exclusions en docs/DESIGN.md ; contrôles statiques ciblés | Aucun contrôle automatisé exhaustif des écrans |

La CI de la livraison précédente a réussi lint, typage, 34 tests, build et audit de dépendances de production. Cette preuve ne remplace pas les essais d'intégration Supabase et de sécurité offensive dans un environnement autorisé.

**Blocage P0 :** le connecteur Supabase rapporte l'instance « Logistique saas's Project », région eu-west-1, statut INACTIVE. Ne pas rejouer les migrations 0001 à 0006 avant de contrôler l'historique et les schémas réels.

## 4. Secteur et chaîne de valeur

La valeur de TransitFlow se situe au croisement de la préparation documentaire, du contrôle des étapes de transit, du partage d'information et de la coordination des responsables. Les opérateurs publics, le consignataire, le transporteur maritime, le terminal et le transitaire conservent chacun leurs responsabilités.

Le Port autonome de Dakar décrit les interactions avec la Douane et les conditions d'enlèvement dans ses pages officielles : https://www.portdakar.sn/infos-pratiques/formalites/douane et https://www.portdakar.sn/nos-services/marchandise/livraison.

**Attention :** certaines pages institutionnelles décrivent des processus historiques ; leur existence en ligne ne prouve pas que chaque étape papier soit encore appliquée en novembre 2026. Les formalités effectives doivent être confirmées auprès d'opérateurs actifs.

## 5. Marché sénégalais et dimensionnement

**CONFIRMÉ :** l'ANSD publie pour 2025 des exportations de 5 805,6 milliards FCFA et des importations de 6 973,9 milliards FCFA. Le bulletin mis en ligne le 5 novembre 2026 indique un cumul des importations de 5 047,4 milliards FCFA à fin septembre 2026. Ces montants **ne sont pas** des revenus de logiciels ni une estimation TAM.

Sources :
- https://www.ansd.sn/Indicateur/note-danalyse-du-commerce-exterieur-nace
- https://www.ansd.sn/Indicateur/bulletin-mensuel-des-statistiques-du-commerce-exterieur

Les annuaires non officiels recensent des transitaires, mais aucune base publique nationale exhaustive et à jour du nombre de clients payants potentiels n'a été confirmée ici. Ne pas annoncer de total à partir d'un seul annuaire.

**Méthode TAM/SAM/SOM :**
- TAM = entreprises concernées x dépense annuelle logiciel plausible, en segmentant transitaires / importateurs / exportateurs ; aucune valeur centrale tant que les deux variables ne sont pas corroborées.
- SAM = comptes atteignables au Sénégal avec le périmètre maritime, la langue, les besoins et les intégrations du MVP.
- SOM = comptes que l'équipe peut raisonnablement convertir et servir pendant les 12-36 premiers mois.
- Faire trois scénarios : bas, central, haut, avec nombres de comptes, prix net, taux d'équipement, rétention, délais commerciaux, et sources pour chaque hypothèse.

**Données à obtenir :** nombre de CDA actifs, dossiers moyens par entreprise, taille des équipes, dépense logiciel, répartition entre maritime et autres modes, compatibilité du pilote avec les procédures courantes.

## 6. Parcours métiers : import et export

**Import maritime, modèle provisoire à valider :** ouverture du dossier → collecte facture/BL/packing list → avis d'arrivée → préparation douane → transmission dans les systèmes habilités → liquidation/contrôle selon le cas → mainlevée ou autorisation pertinente → BAD/enlèvement → livraison → restitution du conteneur lorsqu'applicable → clôture. Plusieurs étapes peuvent intervenir dans un ordre différent selon le régime et les intervenants.

**Export maritime, modèle provisoire :** demande d'expédition → booking → préparation des pièces → empotage/consolidation → entrée terminal → formalités douanières → chargement / VGM lorsque applicable → départ → transbordement éventuel → arrivée → confirmation / clôture.

**Variantes obligatoires :** FCL/LCL, BL maison/maître, conteneur inconnu à la création pour LCL, sous-traitance de déclaration, multi-conteneurs, import temporaire, régime particulier, correction documentaire et annulation, dates incertaines.

**Critère de sortie :** au moins un import FCL, un import LCL et un export vérifiés de bout en bout avec un professionnel habilité.

## 7. Problèmes clients, priorités et méthode de preuve

| Hypothèse de problème | Fonction produit candidate | Mesure de validation |
| --- | --- | --- |
| Difficulté à retrouver une pièce | Coffre-fort attaché au dossier et recherche | Temps médian de recherche avant/après |
| Ressaisie et dispersion | Référentiel client/dossier unique | Nombre de ressaisies par dossier |
| Dossier en attente de responsable | Tâches, owner et échéances | Nombre de dossiers sans prochaine action |
| Multiples relances du client | Portail lecture seule | Sollicitations manuelles par dossier |
| Échéance ou franchise oubliée | Checklist + notification vérifiée | Nombre de dépassements évitables |
| Rentabilité peu visible | Coûts estimés/réels par dossier | Temps de clôture, marge par dossier |
| Evénements conteneur incohérents | Provenance et rapprochement | Pourcentage d'événements corrigés |

**Aucune fréquence ou économie en FCFA n'est démontrée à ce stade.** Enregistrer fréquence, coût, outil actuel, difficulté, personne affectée et preuve. Ne pas attribuer au SaaS un gain non causal.

## 8. Benchmark concurrentiel

| Offre | Capacité documentée | Prix vérifiable / limite |
| --- | --- | --- |
| CargoWise | Forwarding, douane, entrepôts, finance et intégrations selon modules | Prix public comparable non confirmé |
| GoFreight | Gestion de fret et démonstrations commerciales | Devis personnalisé en ligne |
| Magaya | Gestion du fret et intégrations | Coût contractuel à demander |
| Descartes | Logiciels logistiques / douane selon régions | Couverture Sénégal à confirmer |
| Logitude World | Fret, portail, facturation, coûts, automatisations | Smart 75 USD/utilisateur/mois ; Professional 99 USD/utilisateur/mois, page consultée 10 nov. 2026 |
| project44 | API visibilité océan, estimations / événements | Licence, couverture, coût à demander |
| Vizion | Événements normalisés conteneur, REST et webhooks | Clé API commerciale, coût à demander |
| ShipsGo | Tracking par conteneur/BL/booking en crédits | API et tarif annuel selon volume ; devis requis |
| Logiciels sur mesure au Sénégal | Hypothèse concurrentielle terrain | Inventaire à produire |
| Excel, WhatsApp, e-mail | Pratiques à documenter | Coût indirect à mesurer |

Sources :
- https://www.logitudeworld.com/logitude-freight-forwarding-software-pricing/
- https://gofreight.com/pricing
- https://developers.project44.com/guides/shippers/visibility/ocean
- https://docs.vizionapi.com/docs/overview
- https://shipsgo.com/ocean/container-tracking-api

La page de Logitude décrit aussi des fonctionnalités facturation/collection et P&L. **Hypothèse concurrentielle :** une solution locale, légère et accompagnée pourrait séduire les petites équipes ; la validation par démos et entretiens est indispensable.

## 9. Systèmes officiels et intégrations

**GAINDE 2000 / ORBUS** : guichet unique digitalisé, démarches de commerce extérieur. **Port autonome de Dakar / Douanes** : phase pilote annoncée de l'échange électronique des BAD à partir du 2 janvier 2026, état opérationnel précis à confirmer.

Sources : https://www.gainde2000.sn/services/guichet-unique-digitalise et https://www.portdakar.sn/fr/espace-media/communiques-de-presse/le-port-autonome-de-dakar-et-la-direction-generale-des-douanes

**Décisions :** ne pas automatiser les déclarations officielles sans API, contrat et habilitation ; permettre de joindre une preuve et une référence officielle ; distinguer statut interne (« préparation ») d'un statut légal (« mainlevée ») ; conserver provenance et horodatage. Ne pas stocker de secrets institutionnels dans GitHub.

## 10. API maritimes

**MarineTraffic :** documentation officielle d'une API AIS par clé, positions de navires, historique et limitations selon offres. Ce flux ne démontre pas l'embarquement d'un conteneur.

**ShipsGo :** tracking par numéro de conteneur, MBL ou booking ; modèle en crédits ; FAQ annonçant un crédit par nouvelle expédition, mises à jour pendant le voyage et frais annuels API selon volume. La page de prix mentionne trois crédits d'essai pour nouveaux utilisateurs, à revalider à l'inscription.

**Vizion :** API REST de tracking conteneur avec webhooks et données normalisées de transporteurs/terminaux ; commerciale, couverture réelle de Dakar à éprouver sur des dossiers d'essai.

**project44 :** API océan disponibles, devis et conditions à confirmer.

Sources :
- https://servicedocs.marinetraffic.com/
- https://shipsgo.com/ocean/container-tracking-api
- https://shipsgo.com/pricing
- https://docs.vizionapi.com/docs/overview
- https://developers.project44.com/guides/shippers/visibility/ocean

**Architecture recommandée :** adaptateur par fournisseur, journal brut fournisseur distinct du journal métier normalisé ; clés serveur uniquement ; idempotence des webhooks ; rapprochement des références ; gestion des événements tardifs, corrigés ou contradictoires. Champs : source, ID fournisseur, observé le, reçu le, statut de confiance, navire, voyage, conteneur, licence et date de fraîcheur.

**Gates :** devis écrit, tarif par 10/40/150 dossiers, couverture de Dakar testée, clause de sous-licence/redistribution, suppression et rétention, mode dégradé. Toute représentation cartographique d'une donnée fictive reste explicitement marquée « simulation ».

## 11. Dictionnaire documentaire et normes

| Document | Métadonnées à prévoir | Caractère obligatoire |
| --- | --- | --- |
| BL / sea waybill | numéro, émetteur, date, parties, ports, version | selon contrat et opération |
| Booking | numéro, navire/voyage, échéances, conditions | selon dossier |
| Facture commerciale | parties, devise, valeur, Incoterm, version | selon opération |
| Packing list | colis, poids, dimensions, références | selon opération |
| Certificat d'origine | délivreur, pays, date, validité | selon marchandise/régime |
| Assurance | assureur, risques, période, référence | selon contrat |
| Arrival Notice / BAD | compagnie, dates, BL, référence, source | selon arrivée/flux |
| Déclaration douanière | référence officielle, régime, statut prouvé | si dédouanement |
| Justificatif paiement | montant, devise, référence, destinataire | si paiement |
| Preuve de livraison | destinataire, date, réserves, signature | si livraison |

Normes à étudier : ISO 6346 pour le numéro de conteneur et clé de contrôle, SH/HS pour classification, Incoterms 2020, UN/EDIFACT, IMO/MMSI, SOLAS/VGM. L'OMI confirme que la masse brute vérifiée est exigée pour le chargement des conteneurs empotés concernés par SOLAS : https://www.imo.org/en/mediacentre/hottopics/pages/container-default.aspx

Le site du Port de Dakar énumère des pièces import selon l'opération ; ce document ne doit pas être transformé en checklist universelle non validée : https://www.portdakar.sn/infos-pratiques/formalites/douane

## 12. Réglementation et conformité

**CONFIRMÉ :** Sénégal, loi n° 2008-12 du 25 janvier 2008 et décret n° 2008-721 sur les données personnelles ; le site CDP propose formulaires de déclaration et d'autorisation, notamment pour certains transferts internationaux de données.

Sources :
- https://www.cdp.sn/legislation/textes-legislatifs
- https://www.cdp.sn/legislation/textes-reglementaires
- https://www.cdp.sn/conformite/formalites

**À confirmer auprès d'un conseil local :** rôle de responsable/sous-traitant par traitement, formalité CDP applicable, base légale, information et droits des personnes, stockage/transfert hors Sénégal, contrat de sous-traitance, durée de conservation douanière et financière, exigences en matière d'incidents, traitement des sous-traitants cloud et clauses de restitution.

**Autres textes :** transactions électroniques et droit comptable OHADA/SYSCOHADA (si la plateforme émet des documents de facturation). https://www.ohada.org/acte-uniforme-relatif-au-droit-comptable-et-a-linformation-financiere-audcif/

Contrats : CGU, CGV, DPA, confidentialité, conditions du pilote, SLA réaliste, conservation, export et suppression, politique sécurité, responsabilité des statuts et preuves.

## 13. Architecture technique cible

Conserver l'architecture monolithique modulaire Next.js/TypeScript/Supabase/PostgreSQL ; adapter les interfaces externes par services serveur isolés. Pas de microservices prématurés.

Domaine : organization, user, membership, client, shipment, container, customs_case, document, event, task, notification, audit_log, vessel, voyage, external_reference, subscription.

Invariants :
1. Chaque entité client privée est isolée par organization_id.
2. Les jointures cross-tenant doivent être impossibles aussi au niveau des clés étrangères composites.
3. Les états légaux externes ne peuvent être générés par le seul frontend.
4. Les événements sont traçables, horodatés et non effacés silencieusement.
5. Un dossier LCL peut être ouvert sans numéro de conteneur.
6. Aucun événement AIS n'est transformé en preuve de chargement.
7. Les fonctions fournisseurs sont désactivables sans perte du dossier.

Évaluer FastAPI uniquement pour OCR/traitements lourds justifiés. Docker, Terraform, Ansible, AWS seulement si nécessaires aux critères de charge, sécurité ou conformité.

## 14. Cybersécurité et DevSecOps

Menaces prioritaires : BOLA/IDOR, escalation rôle, fuite entre locataires, URL document divulguée, fichiers malveillants, falsification d'événement et de webhook, secret exposé, dépendances vulnérables, absence de sauvegarde et altération non tracée de statut.

Contrôles à effectuer :
- tests RLS négatifs via API authentifiée depuis A vers objets de B ;
- tests upload / read / delete du bucket et expiration des URL ;
- vérification MFA admin, invitation révocable, session, rate limit ;
- contrôle MIME réel et signature de fichiers ; traitement antivirus avant disponibilité ;
- journal d'audit immuable ou protégé ; revue des fonctions SECURITY DEFINER, de leur schéma, des privilèges d'exécution et de leur search_path ;
- contrôle des propriétés sensibles côté serveur ;
- sauvegarde et exercice de restauration ;
- CodeQL/SonarQube, npm audit, dépendances, secrets et suivi CVE ;
- validation des webhooks (authentification, idempotence, rejeu, horodatage).

Les risques API les plus pertinents incluent BOLA, authentification défaillante et mauvaise configuration selon OWASP : https://api-security.owasp.org/editions/2023/en/0x11-t10/
Pour Supabase : https://supabase.com/docs/guides/database/postgres/row-level-security

**La CI verte ne prouve jamais l'isolation RLS en production.**

## 15. UX/UI et accessibilité

Deux expériences : vitrine publique, outil opérationnel. Concevoir d'abord les écrans expéditions, fiche dossier, documents, clients, tâches et droits, puis portail client.

Critères : recherche dossier rapide, filtres, date Africa/Dakar, FCFA, écran mobile utilisable sur réseau moyen, clavier, focus visible, erreurs explicites, données démo marquées, contraste WCAG 2.2 AA pertinent.

Respecter les 20 exclusions détaillées dans docs/DESIGN.md (dégradés violet-bleu, titres en dégradé, emojis, Inter universel, glassmorphism, cartes génériques et bordures colorées, icon boxes, badges décoratifs, Lucide partout, shadcn brut, animations scroll/cursor, boutons qui pâlissent, typographie artificielle, buzzwords, grain sur dégradé, etc.). Les tests actuels ne couvrent pas tous les composants ; maintenir une revue visuelle manuelle.

## 16. Automatisation et IA

**Phase 1 sans IA :** rappels déterministes, tâches, jalons, modèles d'e-mail, files de notifications et déduplication.

**Phase 2 avec validation humaine :** OCR de factures / BL / packing lists, classification de documents, extraction avec indication source/page, détection d'incohérences.

**Phase 3 sous réserve de données suffisantes :** prévision des retards et assistant documentaire par organisation (isolation stricte, permissions et citations).

Aucun modèle IA ne peut publier seul une mainlevée, un montant de taxes officiel, une position maritime ou une décision douanière. Tester précision par type de document et cas difficile, coût par document et risque de fuite à un fournisseur tiers.

## 17. Paiements

**CONFIRMÉ :** la documentation PayTech décrit le checkout, les cibles Orange Money/Wave/Free Money et les notifications IPN pouvant être vérifiées par HMAC-SHA256. https://doc.paytech.sn/doc_paytech.php

**À TESTER :** agrément/éligibilité pour l'entreprise, remboursement, frais, paiements récurrents automatiques réels (ne pas déduire cette capacité d'un exemple « abonnement » de paiement ponctuel), rapprochement bancaire et renouvellement, facturation et taxes.

La BCEAO publie la liste des établissements de paiement agréés dans l'UMOA au 31 août 2026, dont 11 au Sénégal : https://downloads.bceao.int/index.php/fr/communique-presse/liste-des-etablissements-de-paiement-agrees-dans-lumoa-au-31-aout-2026

Ne jamais activer un abonnement uniquement sur redirection de paiement : vérifier la notification authentique serveur, montant, référence, statut, compte et non-répétition.

## 18. Business model et tarification

Tarifs de travail, **non validés** : PME 25 000 FCFA/mois (10 dossiers, 2 utilisateurs) ; Essentiel 60 000 (40,5) ; Pro 150 000 (150,15) ; Entreprise à partir de 350 000, sur devis.

À étudier pendant les entretiens : coût de formation, usage par entreprise, limites volume et stockage, support, moyens de paiement, coût de migration Excel, consentement au contrat et fréquence réelle de facturation. L'API AIS et le tracking conteneurs doivent avoir un quota et un prix séparés.

Facturer une valeur utile dès le premier forfait : dossiers, documents, historique, collaboration élémentaire et protection des données. Aucun prix définitif sans validation de disposition à payer.

## 19. Modèle financier illustratif

**Toutes les valeurs ci-dessous sont des hypothèses de simulation, pas des prévisions garanties.**

Mix théorique d'abonnements : 30 % PME, 60 % Essentiel, 10 % Pro → ARPA pondéré = 58 500 FCFA/mois.

| Comptes actifs | MRR indicatif FCFA | ARR annualisé FCFA |
| ---: | ---: | ---: |
| 5 | 292 500 | 3 510 000 |
| 10 | 585 000 | 7 020 000 |
| 20 | 1 170 000 | 14 040 000 |
| 50 | 2 925 000 | 35 100 000 |
| 100 | 5 850 000 | 70 200 000 |
| 500 | 29 250 000 | 351 000 000 |

Simulation unitaire : 12 000 FCFA de coût direct variable par entreprise/mois → contribution de 46 500 FCFA par compte. Avec 1 200 000 FCFA de frais fixes mensuels hypothétiques, il faudrait environ **26 comptes payants** pour couvrir cette charge, avant taxes et autres coûts exclus.

Projection illustrative avec 8, 30 puis 100 comptes actifs **moyens** par an, même mix et coût direct de 12 000 FCFA par compte/mois :

| Année | Revenu annuel | Coûts directs variables | Contribution après coûts directs |
| --- | ---: | ---: | ---: |
| A1 | 5 616 000 | 1 152 000 | 4 464 000 |
| A2 | 21 060 000 | 4 320 000 | 16 740 000 |
| A3 | 70 200 000 | 14 400 000 | 55 800 000 |

En fixant arbitrairement pour l'illustration 10/15/30 M FCFA de frais fixes annuels, le résultat simplifié serait respectivement -5,536 M / +1,740 M / +25,800 M FCFA. **Cette simulation exclut notamment les taxes, investissements, créances irrécouvrables et coûts non explicitement provisionnés.** La vraie modélisation doit intégrer trésorerie, CAC, churn, onboarding, payroll, licences et coûts fournisseurs validés.

## 20. Stratégie commerciale (go-to-market)

1. Segment de départ : petites et moyennes équipes de transit qui gèrent assez de dossiers pour ressentir la désorganisation, mais ne peuvent justifier un déploiement ERP coûteux ; hypothèse à tester.
2. Pilote encadré chez un professionnel métier volontaire avec données fictives ; puis 2 à 4 entreprises indépendantes.
3. Pitch basé sur preuve : temps de recherche des documents, visibilité sur actions, fréquence de relances, conformité des accès, et non « IA révolutionnaire ».
4. Onboarding dirigé : migration Excel limitée, modèles de statuts, formation en français, support.
5. Commercial : démonstrations dans l'environnement de test, contrats pilotes, témoignages consentis, recommandations et partenariats professionnels.
6. KPI : entretiens → démos → pilotes → comptes payants → renouvellement ; délai jusqu'à première valeur, temps de résolution support.

Aucune promesse de notification WhatsApp, de carte AIS live ou de déclaration dématérialisée tant que l'intégration n'est pas démontrée.

## 21. MVP priorisé selon MoSCoW

**MUST** : authentification ; organisation et rôles ; isolation vérifiée ; clients ; dossiers import/export ; FCL/LCL ; références BL/booking ; conteneurs facultatifs ; documents privés testés ; événements manuels ; actions/échéances de base ; audit et sauvegarde ; affichage honnête des simulations.

**SHOULD** : invitations et révocation, portail client limité, e-mail transactionnel, rapports simples, modèles documentaires selon type d'opération.

**COULD** : coûts estimés/réels par dossier, recherche documentaire enrichie, notifications WhatsApp, tableaux avancés, import CSV guidé.

**WON'T HAVE YET** : déclaration officielle automatique, carte AIS commerciale avant contrat, IA qui décide, prédiction ETA sans historiques fiables, aérien/routier complets, ERP de comptabilité intégral, marketplaces et microservices.

Le classement doit être recalibré après recherche terrain et devis techniques.

## 22. Roadmap et conditions de passage

| Échéance indicative | Résultat | Gate |
| --- | --- | --- |
| 0-30 jours | Supabase actif, migration history contrôlée, tests RLS et Storage A/B, revue de toutes routes | Aucune fuite de données, sauvegarde restaurable |
| 31-60 jours | Parcours métier validé, tâches/échéances, invitations, premières maquettes de portail | 3 profils métier valident les exceptions |
| 61-90 jours | Portail client, e-mails, tests d'intégration, pilotes fictifs et instrumentés | 2 entreprises distinctes réussissent un dossier complet |
| 3-6 mois | Pilote professionnel avec contrat, support, coûts mesurés, sécurisation et corrections | Rétention et valeur mesurées ; conformité revue |
| 6-12 mois | Offres payantes, facturation, tracking fournisseur si rentable, élargissement contrôlé | Conversion démontrée et marge brute positive |

Ce ne sont pas des échéances contractuelles ; elles dépendent du temps disponible, de l'accès Supabase, des fournisseurs et des professionnels.

## 23. Registre des risques

| Risque | Probabilité | Impact | Signal / contrôle préventif | Responsable proposé |
| --- | --- | --- | --- | --- |
| Fuite inter-entreprises | Élevée si non testée | Critique | RLS A/B + test API direct avant pilote | Tech / Sécurité |
| Base Supabase inaccessible | Confirmé actuellement | Critique | Restaurer accès, vérifier migrations | Tech |
| Documents malveillants | Moyenne | Élevé | Signature fichiers + antivirus + quarantaine | Sécurité |
| Statut douanier erroné | Moyenne | Critique | Source, preuve, validation habilitée | Produit / Métier |
| API tracking chère ou inexploitable | Élevée | Élevé | Devis, licence, essais sur Dakar | Produit |
| Marché adressable surestimé | Élevée | Élevé | 20 entretiens + segment + taux de conversion | Commercial |
| Adoption faible | Moyenne | Élevé | Observations in situ, temps de traitement | Produit |
| Coûts support sous-estimés | Moyenne | Élevé | Chronométrer onboarding et tickets | Finance |
| Conformité cloud insuffisante | Indéterminée | Critique | Avis juriste/CDP, DPA, flux données | Juridique |
| Fournisseur indisponible | Moyenne | Moyen/élevé | Retry, circuit breaker, mode manuel | Tech |
| Churn et impayés | Indéterminée | Élevé | KPI et politique recouvrement | Finance |
| Code visuel générique | Moyenne | Moyen | Checklist design + revue de pages | Produit / Design |

Probabilités **qualitatives de planification**, non issues d'une analyse historique d'incidents. Toute action de correction doit être tracée par ticket, propriétaire, date et preuve de clôture.

## 24. Programme pilote et validation terrain

Préparer 20 entretiens (échantillon recommandé : 6 transitaires, 4 déclarants, 4 importateurs, 2 exportateurs, 2 opérateurs, 2 directeurs) sans prétendre qu'ils ont eu lieu. Voir [protocole](PROTOCOLE_TERRAIN.md).

Évaluer :
- 5 dossiers import et 5 export anonymisés ou reconstruits ;
- au moins un LCL sans conteneur connu, un sous-traitant douane et un dossier bloqué ;
- temps de création dossier, recherche pièce, nombre de relances, erreurs, retards, satisfaction ;
- décisionnaire et budget réel, contrat et support.

Succès : parcours complété de bout en bout avec source de chaque statut, pas de fuite tenant, gain mesuré, retours de plusieurs entreprises et volonté de payer documentée.

## 25. Recommandations finales : dix décisions pour le fondateur

1. **D'abord la sécurité réelle**, pas de documents clients avant la validation Supabase A/B.
2. Différencier la **gestion d'un dossier** de la **déclaration douanière officielle**.
3. Vendre un **temps opérationnel réellement économisé**, pas le nombre d'animations.
4. Prendre le document et sa version comme objets métiers de premier ordre.
5. Garder l'option **LCL sans conteneur au départ**.
6. Séparer juridiquement et techniquement tracking conteneur et AIS.
7. Réserver l'IA à des usages vérifiables et supervisés.
8. Adapter le langage, les dates, montants et écrans au Sénégal sans coder tout le produit pour une seule société.
9. Valider l'abonnement auprès d'un décideur payeur avant d'arrêter les tarifs.
10. Construire un MVP exploitable sans API maritime payante, puis étendre uniquement si le retour sur investissement l'exige.

## 26. Bibliographie et preuves de vérification

**Marché Sénégal :**
- ANSD, NACE 2025 : https://www.ansd.sn/Indicateur/note-danalyse-du-commerce-exterieur-nace
- ANSD, bulletin mensuel, mise en ligne 05/11/2026 : https://www.ansd.sn/Indicateur/bulletin-mensuel-des-statistiques-du-commerce-exterieur

**Port et Douane :**
- Port autonome, formalités douanières : https://www.portdakar.sn/infos-pratiques/formalites/douane
- Port autonome, enlèvement : https://www.portdakar.sn/nos-services/marchandise/livraison
- Annonce BAD électronique : https://www.portdakar.sn/fr/espace-media/communiques-de-presse/le-port-autonome-de-dakar-et-la-direction-generale-des-douanes
- GAINDE 2000 : https://www.gainde2000.sn/services/guichet-unique-digitalise
- Douanes Sénégal : https://www.douanes.sn/apply-for-a-customs-credit/?lang=en

**Logiciels et API :**
- Logitude : https://www.logitudeworld.com/logitude-freight-forwarding-software-pricing/
- GoFreight : https://gofreight.com/pricing
- project44 API : https://developers.project44.com/guides/shippers/visibility/ocean
- ShipsGo API : https://shipsgo.com/ocean/container-tracking-api
- ShipsGo prix : https://shipsgo.com/pricing
- Vizion : https://docs.vizionapi.com/docs/overview
- MarineTraffic : https://servicedocs.marinetraffic.com/

**Réglementation / normes :**
- CDP législation : https://www.cdp.sn/legislation/textes-legislatifs
- CDP réglementation : https://www.cdp.sn/legislation/textes-reglementaires
- CDP formalités : https://www.cdp.sn/conformite/formalites
- OHADA AUDCIF : https://www.ohada.org/acte-uniforme-relatif-au-droit-comptable-et-a-linformation-financiere-audcif/
- OMI/SOLAS/VGM : https://www.imo.org/en/mediacentre/hottopics/pages/container-default.aspx
- OWASP API 2023 : https://api-security.owasp.org/editions/2023/en/0x11-t10/
- Supabase RLS : https://supabase.com/docs/guides/database/postgres/row-level-security
- BCEAO établissements de paiement (31/08/2026) : https://downloads.bceao.int/index.php/fr/communique-presse/liste-des-etablissements-de-paiement-agrees-dans-lumoa-au-31-aout-2026
- PayTech API : https://doc.paytech.sn/doc_paytech.php

**Preuves internes :** README, docs/ROADMAP.md, docs/STATUS_2026-10-16.md, docs/SECURITY.md, docs/DESIGN.md, les migrations 0001-0006, tests et GitHub Actions de la branche main au 10/11/2026.

---

### Données manquantes et limites du rapport

Cette recherche n'a pas mené d'entretiens ni collecté de dossiers professionnels autorisés. Il n'y a pas encore de prix contractuels des fournisseurs AIS/tracking, de TAM/SAM/SOM chiffrés fiables, de tarification approuvée par les clients, de revue juridique signée, de test Supabase distant ni de test de restauration. Aucun chiffre financier de simulation ne doit figurer dans un pitch comme performance réelle.

**Règle d'actualisation :** archiver chaque nouvelle preuve avec URL/date, remplacer les hypothèses lorsqu'une mesure existe, et faire approuver les décisions sensibles par le référent métier, sécurité ou juridique compétent.
