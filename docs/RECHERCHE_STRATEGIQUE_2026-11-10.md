# TransitFlow SN : recherche stratégique et décisions produit
Mise à jour : 10 novembre 2026. Document de cadrage fondé sur un examen du dépôt et des sources publiques. **Ce document n'est ni une enquête terrain ni un avis juridique.**

## 1. Constat et périmètre vérifiés

- Dépôt : [SAAS-logistique-douaniere](https://github.com/htspathe/SAAS-logistique-douaniere), application Next.js, TypeScript, Supabase et PostgreSQL.
- Le code contient inscription/connexion, organisations, clients, expéditions, événements manuels, conteneurs et documents privés. Le dashboard utilise des requêtes filtrées sur l'organisation active.
- **Non validés à ce stade** : migrations et tests RLS sur l'instance Supabase réelle, stockage/signatures des URL en contexte de test, invitation des collaborateurs, portail client, notifications automatiques, antivirus, supervision, suivi AIS et suivi conteneur contractuels.
- Les vues maritimes et les alertes du dashboard sont des simulations. Ne jamais les présenter comme des événements réels.
- Lire également [état du MVP](STATUS_2026-10-16.md), [roadmap](ROADMAP.md), [sécurité](SECURITY.md) et [design](DESIGN.md).

## 2. Données de marché vérifiables, sans confusion avec le marché logiciel

Selon la [Note d'analyse du commerce extérieur 2025 de l'ANSD](https://www.ansd.sn/Indicateur/note-danalyse-du-commerce-exterieur-nace), les exportations du Sénégal ont atteint **5 805,6 milliards FCFA** en 2025 et les importations **6 973,9 milliards FCFA**. Cela confirme l'importance économique des flux commerciaux, **pas** le chiffre d'affaires potentiel de TransitFlow. Les exportations comprennent notamment des produits énergétiques : la valeur des marchandises ne donne ni le nombre de dossiers de transit accessibles ni le budget logiciel moyen.

**À obtenir pour calculer TAM/SAM/SOM :** nombre de transitaires actifs par segment, nombre de PME importatrices/exportatrices prêtes à s'équiper, dossiers mensuels par entreprise, logiciel actuel, décisionnaire, budget et conditions d'achat. Publier des fourchettes et des hypothèses explicites, jamais des chiffres inventés.

## 3. Écosystème institutionnel et intégrations possibles

- [GAINDE 2000](https://gainde2000.sn/a-propos) documente ORBUS, les démarches de dématérialisation et le Guichet unique de l'enlèvement. Son [service de guichet unique](https://www.gainde2000.sn/services/guichet-unique-digitalise) couvre dépôt et suivi de démarches. TransitFlow doit **compléter** les systèmes officiels et non prétendre les remplacer.
- Le [Port autonome de Dakar](https://www.portdakar.sn/fr/espace-media/communiques-de-presse) annonce une **phase pilote d'échange électronique des Bons à Délivrer à compter du 2 janvier 2026** avec la Douane. Il faut confirmer le périmètre et l'état opérationnel actuel avant toute intégration.
- La [Direction générale des Douanes](https://www.douanes.sn/apply-for-a-customs-credit/?lang=en) distingue notamment les catégories d'opérateurs habilités pour certaines procédures. Ne pas assimiler un compte utilisateur SaaS à une habilitation de déclarant agréé.
- Les conditions de franchises et frais varient selon marchandise, terminal et contrat. Le [Port de Dakar](https://www.portdakar.sn/nos-services/marchandise/stockage-entreposage) publie certains délais pour marchandises conventionnelles et véhicules ; **ne pas extrapoler ces délais aux conteneurs**.

**Décisions :** aucune télétransmission douanière dans le MVP sans autorisation formelle ; enregistrer la source, l'auteur, l'heure et la nature de chaque statut ; prévoir des adaptations nationales sans coder des règles supposées universelles.

## 4. Suivi conteneur et suivi navire : deux produits différents

- L'[API MarineTraffic](https://servicedocs.marinetraffic.com/) décrit des positions AIS de **navires**, soumises à authentification et à des conditions contractuelles. Une position AIS peut être ancienne si la couverture manque, selon la [documentation du service](https://support.marinetraffic.com/en/articles/9552663-the-ais-protocol).
- [ShipsGo](https://shipsgo.com/fr/faq) propose une logique de crédits de suivi par numéro de conteneur ou BL selon ses conditions publiées.
- Étudier aussi Vizion et les données des transporteurs, mais obtenir **tarifs signés, couverture Dakar, droits de sous-licence et quotas** avant achat.

**Règle métier non négociable :** conteneur → BL/booking → voyage → navire → IMO/MMSI → AIS. Ne jamais déduire qu'un conteneur est à bord du seul fait de la présence du navire. Champs recommandés : `source_provider`, `source_event_id`, `observed_at`, `received_at`, `confidence` et `is_demo`.

**Prototype :** conserver le tracking manuel, rendre visible « démonstration », ne promettre ni carte live ni ETA confirmée.

## 5. Documents et règles métier

Documenter en priorité : BL / sea waybill, booking, arrival notice, facture commerciale, packing list, certificat d'origine, assurance, déclaration, bon à délivrer, justificatifs de paiement et preuve de livraison. Pour chaque pièce : origine, auteur, statut, confidentialité, version, date, obligations selon le régime et durée légale à valider.

Une expédition LCL peut exister sans numéro de conteneur connu. Les formalités diffèrent à l'import, à l'export et selon le type de marchandise. Ne pas rendre une checklist universellement obligatoire.

L'[Organisation maritime internationale](https://www.imo.org/fr/ourwork/safety/pages/verification-of-the-gross-mass.aspx) précise que la VGM est une condition du chargement des conteneurs empotés concernés par SOLAS. Prévoir le champ et sa preuve lorsque pertinent, sans imposer ce contrôle aux dossiers hors champ.

## 6. Données personnelles, conformité et responsabilité

La [CDP sénégalaise](https://www.cdp.sn/legislation/textes-legislatifs) publie la loi n° 2008-12 sur les données personnelles ; le [décret n° 2008-721](https://www.cdp.sn/legislation/textes-reglementaires) figure dans les textes d'application. À valider avec un conseil local : qualification des parties (responsable/sous-traitant), formalités CDP, transferts hors du Sénégal, durées de conservation, clauses DPA, CGV/CGU, gestion des violations et droits des personnes.

**Bloquants production :** tests RLS négatifs entre deux entreprises, MFA des administrateurs, règles de téléchargement, analyse antivirus, journaux d'audit, restauration de sauvegarde, politique de conservation et procédure d'export/réversibilité.

## 7. Paiements et abonnements

La [documentation PayTech](https://doc.paytech.sn/doc_paytech.php) expose un checkout, des méthodes incluant Wave/Orange Money et des notifications IPN sécurisables par HMAC. L'environnement de test peut entraîner un débit de test ; ne pas le traiter automatiquement comme gratuit. L'éligibilité marchande, les frais et la répétition d'un abonnement doivent être validés contractuellement.

Avant d'intégrer les paiements : définir période de facturation, limites de dossiers/utilisateurs, prorata, taxes, retards de paiement, annulations, remboursement et suspension **sans rendre inaccessibles les documents que le client doit pouvoir exporter**.

## 8. Benchmark concurrentiel à compléter

| Produit ou solution | Angle à évaluer | Vérification manquante |
|---|---|---|
| CargoWise | couverture opérationnelle du transit | prix et intégration Sénégal |
| GoFreight | workflow dossiers, portail et facturation | prix, onboarding local |
| Magaya | documentation et gestion du fret | flux douaniers Sénégal |
| Descartes | transit et connecteurs | licences/API |
| Logitude | ergonomie des petites équipes | adoption au Sénégal |
| project44 | visibilité transport et ETA | coût/couverture régionale |
| Vizion | événements conteneurs | qualité Dakar et licence |
| ShipsGo | tracking conteneur par crédit | coût réel par dossier |
| Solutions sur mesure locales | adaptation du terrain | entretiens et démonstrations |
| Excel, e-mail, WhatsApp | solution concurrente de fait | temps/coûts de l'existant |

Ne pas publier de classement ni de prix chiffrés sans source et date.

## 9. Hypothèses commerciales à mesurer

Hypothèses issues du document [business model](BUSINESS_MODEL.md) : 25 000 / 60 000 / 150 000 FCFA par mois et entreprise sur les segments PME/Essentiel/Pro, et offre Entreprise sur devis. **Aucune validation de disposition à payer n'est documentée.**

Indicateurs à mesurer : délai de traitement d'un dossier, temps de recherche de documents, nombre de relances clients, retards évités, rétention 30/90 jours, adoption des équipes, taux de conversion pilote → abonnement. Pour la rentabilité : MRR, marge brute après coûts variables de stockage/API/support, CAC et durée de vie client.

## 10. Priorités produit issues de la recherche

| Ordre | Priorité | Justification et preuve attendue |
|---|---|---|
| P0 | Supabase accessible, migrations 0001-0006, tests négatifs RLS | condition de sécurité non négociable |
| P0 | Dossiers, documents, conteneurs et dashboard testés sur 2 entreprises | premier parcours métier réel |
| P0 | Navigation sans contrôles factices et mentions honnêtes du prototype | confiance et utilisabilité |
| P1 | Invitations et révocation de membres | utilisation par une équipe réelle |
| P1 | Portail client à droits séparés | réduire les demandes de statut |
| P1 | Tâches, dates, alertes e-mail et journal des envois | valeur opérationnelle mesurable |
| P1 | Sauvegardes, antivirus, monitoring, MFA, audit | préproduction |
| P2 | AIS et événements conteneurs avec fournisseurs distincts | coût et licences à vérifier |
| P2 | Facturation récurrente, quotas et paiements | après validation des tarifs |
| P3 | OCR/IA, prédiction, connecteurs douaniers officiels | données, accès et contrôles nécessaires |

## 11. Programme de recherche terrain (non encore réalisé)

Conduire environ 20 entretiens : 6 transitaires, 4 déclarants, 4 importateurs, 2 exportateurs, 2 exploitants et 2 responsables de direction. Échantillon **indicatif**, non prétendu recruté.

Obtenir avec accord : 5 dossiers import et 5 dossiers export fictifs ou anonymisés, parcours d'un dossier avec un professionnel, listes de statuts réellement utilisés, documents obligatoires selon opérations, règles de calcul des frais, budget logiciel annuel et critères d'achat.

Lire le [protocole d'entretiens](PROTOCOLE_TERRAIN.md). Éviter de collecter des données clients réelles avant conformité et tests de sécurité.

## 12. Gates de décision, à ne pas contourner

1. **Gate métier** : au moins trois profils expliquent et valident un parcours import/export complet.
2. **Gate sécurité** : RLS/Storage, permissions, antivirus, restauration et MFA testés sur instance réelle.
3. **Gate produit** : un utilisateur termine un dossier de bout en bout, sans aide technique, avec documents.
4. **Gate économique** : coût mensuel par client et disposition à payer documentés.
5. **Gate intégration** : contrat écrit pour chaque API, source/fraîcheur visibles, mode dégradé testé.
6. **Gate commercial** : contrat pilote, support, sauvegardes et export de données prêts.

## 13. Recherches ouvertes

- Entreprises de transit réellement actives, segmentation et nombre moyen de dossiers (TAM/SAM/SOM).
- Tarifs et accès API fournisseurs, interfaces officielles et disponibilité d'une sandbox.
- Coût complet d'une déclaration, surestaries, franchise conteneurs par terminal/transporteur.
- Conformité CDP et fiscalité des abonnements B2B au Sénégal.
- Référence métier documentaire validée par plusieurs professionnels.
- Disponibilité opérationnelle actuelle du projet Supabase lié au dépôt.
- Accessibilité et performance mobile mesurées sur le prototype déployé.
- Étude financière 3 ans après obtention de données réelles.

**Règle de méthode** : chaque nouvelle affirmation doit être marquée `confirmée`, `hypothèse`, `à tester` ou `hors périmètre`, datée et sourcée. Ne pas convertir des intentions du cahier des charges en fonctionnalités prétendument livrées.
