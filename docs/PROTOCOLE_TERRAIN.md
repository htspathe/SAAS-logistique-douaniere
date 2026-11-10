# Protocole d'enquête terrain : TransitFlow SN
Date : 10 novembre 2026. **Modèle à utiliser lors des visites, aucune enquête réalisée par ce document.**

## Objectifs et échantillon

Objectif indicatif : 20 entretiens, dont 6 transitaires, 4 déclarants, 4 importateurs, 2 exportateurs, 2 opérateurs et 2 décideurs. Répartir les tailles d'entreprise et les niveaux de digitalisation ; ne pas se limiter à la première entreprise pilote.

Avant l'entretien : expliquer la recherche, demander un accord explicite, ne pas enregistrer sans autorisation, ne pas collecter de secrets ou de documents clients non anonymisés. Stocker les notes sensibles hors du dépôt Git public.

## Questions d'entretien (ne pas suggérer les réponses)

1. Décrivez votre dernier dossier d'import de son ouverture à sa clôture.
2. Qui intervient à chaque étape et qui signe ou confirme les changements ?
3. Combien de dossiers traitez-vous par mois, en import et en export ?
4. Quelle proportion est FCL ou LCL ? Interne, externe ou mixte pour la douane ?
5. Quels outils utilisez-vous chaque jour ? Quel est leur rôle exact ?
6. Dans quels cas revenez-vous à Excel, au papier, à l'e-mail ou à WhatsApp ?
7. Quel problème récent vous a fait perdre le plus de temps ?
8. Quel document manque ou doit être corrigé le plus souvent ?
9. Quand commencez-vous à surveiller les franchises et les surestaries ?
10. Comment distinguez-vous les frais terminaux, détention et surestaries ?
11. Comment recevez-vous la preuve du statut douanier ?
12. Comment informez-vous votre client ? Combien de demandes de suivi par dossier ?
13. Pouvez-vous retrouver une pièce précise d'un dossier fermé ?
14. Comment déduisez-vous le coût et la marge d'un dossier ?
15. Quels logiciels avez-vous essayés et pourquoi les avez-vous conservés ou abandonnés ?
16. Quelles données sont accessibles automatiquement via les systèmes que vous utilisez ?
17. Quel cas particulier votre outil actuel gère-t-il mal ?
18. Qui décide de l'achat d'un logiciel et quel budget réel y est consacré ?
19. Quelles garanties exigerez-vous sur la sécurité, le support et l'export des données ?
20. Quels résultats mesurables vous feraient accepter un pilote, puis un abonnement ?

## Observation de dossiers

Pour chaque dossier observé, noter sans données identifiantes : direction, FCL/LCL, régime, mode de dédouanement, dates clés, documents nécessaires et manquants, intervenants, statut d'origine (avec source), incidents, durée réelle, retard, coût mesuré et nombre de sollicitations client.

Vérifier cinq cas : import FCL normal ; import LCL sans numéro de conteneur à l'ouverture ; export maritime ; déclaration par prestataire externe ; dossier bloqué avec document manquant ou changement d'ETA.

## Mesures avant / après pilote

| Indicateur | Définition et méthode |
|---|---|
| Temps de création | Chronométrer l'ouverture d'un dossier équivalent dans deux outils |
| Recherche de document | Temps nécessaire pour retrouver une pièce nommée |
| Saisies redondantes | Nombre de champs recopiés et reprises de saisie |
| Relances | Nombre de demandes manuelles de statut par dossier |
| Erreurs documentaires | Corrections significatives constatées sur la période |
| Dossiers en retard | Pourcentage de dossiers dépassant une échéance définie |
| Coût incident | Montant prouvé : ne pas attribuer au logiciel tout coût évité |
| Adoption | Utilisateurs actifs, tâches finies et retours d'usage |
| Rentabilité pilote | Temps gagné × coût horaire vérifié, moins coûts de l'outil |
| Intention d'achat | Décideur identifié, conditions et budget autorisé |

## Matrice de dépouillement

Pour chaque besoin : code anonyme de l'entretien, citation courte consentie, fréquence (observée ou déclarée), impact, preuve, solution existante, coût en FCFA s'il est documenté, priorité MoSCoW, hypothèse à tester dans le produit.

Ne transformer en `Must have` que les cas à forte fréquence/gravité soutenus par plusieurs sources, ou un contrôle légal/sécurité impératif.

## Condition de démarrage du pilote

- Projet Supabase accessible et migrations réellement vérifiées.
- Tests négatifs RLS et Storage A/B réussis.
- Données fictives ou anonymisées jusqu'à mise en conformité.
- Contrat pilote définissant support, responsabilités, durée et export.
- Référent métier, critères de succès, méthode d'incident et point d'arrêt.
- Aucune promesse d'AIS ou de notification automatique sans intégration confirmée.

## Rapport à remettre après terrain

1. Échantillon et limites.
2. Processus détaillés et exceptions.
3. Les dix problèmes les plus coûteux avec preuves.
4. État des outils et solutions concurrentes.
5. Priorisation des fonctionnalités par valeur, fréquence, risque et coût.
6. Validation ou rejet des hypothèses tarifaires.
7. Backlog MVP révisé et décisions signées.
