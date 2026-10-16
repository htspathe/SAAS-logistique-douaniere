# Plan de mise en service — TransitFlow SN (16 octobre 2026)

## Hypothèses

- Une personne techniquement autonome travaillant **35–40 h/semaine**, assistée par l'IA pour le code et les tests.
- Périmètre initial : transitaires et PME au Sénégal, import/export maritime, FCL/LCL, organisations isolées, dossiers, conteneurs, documents, tâches et notifications e-mail.
- Une entreprise pilote et une deuxième entreprise indépendante avec des données fictives jusqu'à validation de la sécurité.
- Pas de déclaration douanière automatique ni de promesse de suivi de conteneur en temps réel : ces flux exigent des intégrations spécifiques.
- Le suivi AIS **du navire** n'établit pas que le conteneur est toujours à bord ; le tracking conteneur demande une source différente.

## Situation de départ

Le correctif critique des dépendances (Next.js 16.4.2 et versions transitives corrigées) a passé audit, lint, TypeScript, tests et build, puis a été fusionné dans `main` via la PR #12.

Au 16 octobre, le projet Supabase lié à ce dépôt est signalé `INACTIVE` par le connecteur ; les lectures des migrations et des tables expirent. Il faut restaurer l'accessibilité et vérifier l'état réel du schéma avant toute mutation.

La PR #10 du tableau de bord est distincte de la correction de sécurité et doit être réévaluée après la mise à jour de `main`.

## Étapes ordonnées et critères de sortie

| Ordre | Étape | Estimation de travail | Condition de passage |
| --- | --- | --- | --- |
| 1 | Remettre Supabase accessible, vérifier l'historique 0001–0006 et l'état du bucket | 2–4 jours | Connexion SQL fiable, aucun rejeu de migration existante |
| 2 | Tests RLS et flux réels entre entreprises A et B : auth, clients, dossiers, conteneurs, événements, fichiers | 4–7 jours | Tests négatifs via API + UI, pas de fuite inter-entreprises |
| 3 | Finaliser dashboard réel, navigation, gestion des erreurs, états vides | 3–5 jours | Comptages exacts, liens fonctionnels et mobile |
| 4 | Invitations collaborateur, rôles et gestion d'accès | 4–7 jours | Invitation, acceptation, révocation et droits testés |
| 5 | Portail client à autorisations séparées | 6–10 jours | Le client ne voit que ses propres dossiers et documents autorisés |
| 6 | Tâches, responsables, échéances, e-mail transactionnel et journal des envois | 6–10 jours | Notifications testées, doublons contrôlés, erreurs rejouables |
| 7 | Sécurisation finale : MFA admin, rate limiting, antivirus fichiers, logs, sauvegardes/restauration, revue du stockage | 5–10 jours | Audit et essais de restauration, politique de conservation définie |
| 8 | Déploiement de préproduction, tests exploratoires métier, corrections et pilote sur deux entreprises | 10–15 jours | Deux profils métier indépendants valident les parcours de bout en bout |
| 9 | Tarification/abonnement B2B, gestion des quotas et factures | 5–10 jours additionnels | Parcours d'abonnement et de renouvellement testé |
| 10 | Intégration tracking conteneurs + fournisseur AIS navires, ETA et fraîcheur des sources | 10–20 jours additionnels | Sources, licences, coût par appel et mode dégradé validés |

Les durées sont des **charges de travail indicatives** et non un calendrier contractuel. Prévoir un tampon pour les corrections découvertes aux étapes 1, 2 et 8. Les étapes 9–10 peuvent être reportées après les premiers pilotes, sans prétendre fournir le suivi en temps réel pendant ce temps.

## Jalons réalistes

En partant du 16 octobre 2026, avec une personne à temps plein et sans blocage fournisseur majeur :

1. **Pilote interne limité (dossiers, documents, comptes internes)** : 4–6 semaines, environ mi-novembre à fin novembre 2026.
2. **MVP pour premiers clients avec portail, tâches, e-mails, tests et supervision** : 8–12 semaines, environ mi-décembre 2026 à début janvier 2027.
3. **Offre commerciale étendue avec abonnements et intégrations maritimes contractuelles** : 12–20 semaines, environ début janvier à début mars 2027.

À mi-temps, tabler plutôt sur 1,7–2,2 fois ces délais. Une équipe de deux développeurs expérimentés peut raccourcir la durée calendaire, mais pas les validations métier et fournisseur.

## Coûts de fonctionnement à préciser

- **Base de référence avant dépassements** : Supabase Pro environ **25 USD/mois**, Vercel Pro environ **20 USD/mois** pour un siège, Resend gratuit sous quota ou Pro **20 USD/mois**. Ces montants ne couvrent ni consommation excédentaire, ni nom de domaine, ni support, ni coûts de développement.
- **AIS** : à budgéter séparément. Exemple public VesselFinder : **330 EUR pour 10 000 crédits** valides douze mois, hors TVA, avec tarification différente selon les réponses terrestres/satellites. Ce n'est pas une offre illimitée ; la fréquence, les volumes et la licence changent les coûts.
- **WhatsApp** et **paiement** : prix, disponibilité locale et contraintes d'intégration à valider auprès des fournisseurs choisis ; non indispensables au pilote initial.
- Réserver un budget de tests d'utilisabilité, sauvegardes, monitoring et support utilisateur. Ne pas publier de données clients réelles avant validation RLS complète.

## Critère « fonctionnel »

Un SaaS est considéré fonctionnel en pilote quand un compte réel peut s'inscrire et gérer une organisation, inviter un collègue, créer un client et un dossier, déposer et récupérer ses documents, gérer une échéance, recevoir un e-mail, et laisser le client final consulter **uniquement** ce qui lui est partagé, le tout sans accès inter-entreprises. Les métriques et événements affichés doivent être de source connue et datée.

Une carte AIS démonstrative et des données fictives ne sont pas des fonctions de suivi opérationnel.

## Dépendances externes et risques de retard

1. Projet Supabase inactif, état réel des migrations inconnu.
2. Politique de stockage et RLS d'accès portail client délicates à valider.
3. Disponibilité et contrat fournisseur AIS/tracking conteneurs, souvent payants.
4. Définition métier des documents obligatoires selon type d'opération.
5. Gestion des paiements et contrats de service, support et obligations applicables au marché ciblé.
