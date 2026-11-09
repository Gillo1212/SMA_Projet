# TODO — SMALIM

Reste à faire, relevé le 2026-10-20. À traiter plus tard, par ordre de priorité.

## 1. ~~Inscription client non branchée~~ ✅ fait le 2026-10-25

- La page appelle `authService.clientRegister()` et affiche les erreurs de l'API.
- Corrigé au passage : le backend rejetait les numéros au format `+221…`.
- **Reste lié** : l'envoi d'emails échoue (`535-5.7.8 Username and Password not accepted`). Les identifiants SMTP du `.env` sont refusés par Gmail : il faut un **mot de passe d'application** Gmail (pas le mot de passe du compte). Sans ça, l'email de confirmation d'adresse ne part pas.

## 2. ~~Internationalisation FR/EN~~ ✅ fait le 2026-10-25

Périmètre décidé le 2026-10-25 : **site public + espace client**. Le portail admin reste en français (outil interne).

- ✅ Lot A : pages d'authentification (connexion admin/client, inscription, mot de passe, confirmation d'email).
- ✅ Lot B : À propos, 404, comparateur, demande de devis, fiche produit.
- ✅ Lot C : espace client (tableau de bord, commandes, devis, factures, machines, support, profil, sidebar, layout, notifications) + sélecteur de langue dans l'espace client.
- ✅ Reliquats des pages déjà traduites : contact, panier, checkout, fiche machine, article de blog.
- Vérifié dans Chrome (Playwright) : chaque page en FR et en EN, inscription, connexion, espace client, commande complète jusqu'au paiement simulé.
- Volontairement non traduits : `paiement/simulation` (outil de dev), `commande/confirmation` (page supprimée, voir §7).
- **Limites restantes** :
  - Les messages d'erreur renvoyés par le backend (« Cet email est déjà utilisé », « Email ou mot de passe incorrect »…) restent en français.
  - `machines.service.ts` fabrique des libellés en français : « Sur devis », « Populaire », niveaux de stock.
  - Les données du catalogue (noms, descriptions, catégories, délais) sont en français dans la base.

## 2 bis. ~~Panier : montants incohérents avec le backend~~ ✅ fait le 2026-10-25

- TVA, 3 modes de livraison (actif / tarif) et seuil de livraison standard offerte sont réglables dans **Admin → Paramètres → TVA & livraison**. Codes promo gérés dans **Admin → Paramètres → Codes promo**.
- Panier et checkout calculent comme le backend (`frontend/src/utils/orderTotals.ts`), le code promo est validé par l'API et transmis à la commande, le checkout exige un compte client.
- Vérifié de bout en bout dans Chrome : réglage admin → panier → checkout express + code promo → commande en base identique au franc près.
- ✅ **Page Paramètres entièrement reliée** (2026-10-26) : Administrateurs, Email & SMTP (test réel, mot de passe chiffré), Notifications (commande, devis, client, stock faible), Entreprise (coordonnées affichées sur Contact et À propos), Sécurité. Vérifié dans Chrome (19/19).
- ✅ **Commandes et devis (back-office)** (2026-10-26) : fenêtres de gestion (étape suivante, annulation / remboursement / refus confirmés, proposition de devis avec validité), onglets par statut avec compteurs serveur. Badges de la barre latérale, cloche et tableau de bord suivent les changements sans rechargement (`GET /dashboard/counters`, rafraîchis toutes les 60 s et à chaque action). Stats corrigées : mois calendaire comparé au mois précédent, chiffre d'affaires hors commandes annulées / remboursées.
- ✅ **Réception confirmée par le client + refonte de l'espace client** (2026-10-26) : bouton « Confirmer la réception » sur une commande expédiée (ou prête au retrait), « Signaler un problème » qui ouvre un ticket prérempli, équipe prévenue. Nouvelle barre latérale, onglets en bas sur mobile, tableau de bord avec actions rapides et bloc « À faire », pages Factures / Machines / Support / Profil adaptées au mobile. Vérifié dans Chrome, bureau et iPhone (31/31).
  - Option non faite : confirmation automatique après N jours sans action du client (demande une tâche planifiée).
- ✅ **Espace client : commandes et devis** (2026-10-26) : fenêtres de détail (suivi, montants, historique, livraison, paiement), réponse à une proposition avec confirmation (refusée par l'API si expirée ou déjà traitée, l'équipe est prévenue par email), pastilles du menu et cloche à jour (propositions reçues, suivi des commandes, état « lu » conservé), tableau de bord client corrigé (total payé hors annulations, nombre réel de machines). FR / EN. Vérifié dans Chrome (29/29).
- **À faire de ton côté** : saisir les vraies coordonnées dans Paramètres → Entreprise (la page Contact masque les champs vides), et configurer le SMTP dans Paramètres → Email & SMTP (mot de passe d'application Gmail), puis renseigner l'email de réception des notifications.

## Ancien constat (2 bis), pour mémoire

- `pages/panier/page.tsx` offre la livraison au-delà de 50 000 FCFA, et la fiche produit l'annonce (« Livraison gratuite dès 50 000 FCFA »). **Le backend ne connaît pas cette règle** : il facture 0 / 2 500 / 5 000 FCFA selon le mode (`DELIVERY_FEES` dans `orders.controller.js`). Le client voit un total dans le panier, puis un autre au checkout.
- Le panier valide les codes promo avec une liste codée en dur (`BIENVENUE10`, `SMA2026`, `FIRST20`) au lieu d'appeler l'API. (Le message d'erreur, qui affichait les codes valides, est maintenant générique.)
- Le checkout n'exige pas d'être connecté, alors que `POST /orders` le demande : un visiteur anonyme remplit tout le tunnel puis reçoit une erreur. Rediriger vers la connexion client avant l'étape adresse (ou proposer la création de compte, déjà amorcée dans le formulaire).

## 2 quater. ~~Connexion lente~~ ✅ fait le 2026-11-08

- `bcryptjs` remplacé par le paquet natif `bcrypt` 6. Les hachages existants (`$2a$`) restent valides, les nouveaux sont en `$2b$`.
- Mesuré sur la machine de dev (Celeron N5100) : environ 0,5 s par connexion avant, 0,4 s après. Les 4 s notées au départ venaient surtout de l'ancien disque G:. Le vrai gain est sous charge : 4 connexions simultanées passent de 2,1 s à 0,6 s, et le serveur n'est plus bloqué pendant le calcul (jusqu'à 400 ms avant, environ 25 ms après).
- Vérifié dans Chrome : connexion admin (mauvais puis bon mot de passe), connexion client avec un ancien hachage, inscription, connexion du nouveau compte, changement de mot de passe. Compte de test supprimé.
- À faire : décider de la règle de livraison (l'implémenter côté backend, ou retirer la mention), et faire valider les codes promo par l'API.

## 2 ter. ~~Comparateur : données manquantes~~ ✅ fait le 2026-11-08

- Le comparateur cherchait des clés anglaises (`power`, `weight`…) alors que la base stocke des clés françaises (`alimentation`, `poids`…), et affichait une capacité et une « maintenance incluse » qui n'existent pas en base (toujours « N/A » et ✗).
- Les lignes techniques sont maintenant construites à partir des caractéristiques réellement renseignées pour les machines comparées ; une valeur absente s'affiche « — » (« Non renseigné »). Ajout de Marque et Modèle. La ligne Maintenance n'apparaît que si la donnée existe.
- « Ajouter au comparateur » sur la fiche machine pré-remplit le comparateur ; la sélection est dans l'URL (`?machines=slug1,slug2`), donc partageable.
- Mobile : colonnes plus compactes, titre de section qui reste visible au défilement horizontal.
- Vérifié dans Chrome : depuis la fiche, ajout / retrait, lien avec machine inconnue ou en double, FR / EN, mobile 390 px.
- **Reste** : seule la Lecon Good Taste 50S a une fiche technique complète (voir §3) ; tant que les autres ne sont pas renseignées, le comparateur montre surtout des « — ». Si « Maintenance incluse » doit revenir, il faut un vrai champ en base et dans l'admin.

## 3. Catalogue et contenus réels à compléter

Le catalogue ne contient plus que les produits de la banque d'images : 5 machines et 5 matières premières. Les consommables sans photo (gobelets, snacks, pièces détachées) ont été retirés. Restent à fournir ou corriger :

- **Prix provisoires** des matières premières (Craft Roasters Colombie 14 500, Kingsmill 13 500 à 14 500 FCFA) : à remplacer par les vrais tarifs depuis l'admin. Les sachets portent la mention 907 g, à confirmer pour chaque produit.
- **Stocks** des 5 machines et 5 matières premières : valeurs fictives.
- **Fiches techniques** : seule celle du Lecon Good Taste (modèle 50S) vient d'une vraie fiche (PPTX de la banque). Pour Sapoe AVM, Lecon 4 saveurs, SEN Coffee et NEXX, les caractéristiques se limitent à ce qui est visible sur les photos : dimensions, poids, puissance, capacité, modèle exact à compléter.
- **Coordonnées de contact** qui semblent fictives : « +221 33 123 45 67 », « +221 77 123 45 67 », « Zone industrielle de Dakar, Rue 15, Parcelle 234 », adresses `@sma-senegal.com` (page Contact, bouton « Nous appeler » de la page À propos). À remplacer par les vraies.
- **Témoignages de l'accueil** (Amadou Diallo, Fatou Sall…) : à remplacer par de vrais avis clients, avec leur accord, ou à retirer avant la mise en ligne. Publier des témoignages inventés est trompeur et peut poser un problème légal.
- **Article de blog « Nouvelle gamme de consommables SMALIM »** : il présente gobelets, snacks et pièces détachées, retirés du catalogue. À réécrire ou à archiver. Les articles « showroom » et « étude de cas UCAD » citent encore les modèles TCN.
- **Catégories machines vides** : « Machines à glace » et « Équipements frigorifiques » n'ont aucun produit. Les garder pour de futurs produits, ou les supprimer depuis l'admin.
- **Mocks frontend** (`src/mocks/`, utilisés seulement sans `VITE_API_URL`) : toujours l'ancien catalogue TCN.
- **Panier, checkout, confirmation de commande** : pas d'image de repli si un produit n'a pas de photo.
- **Logos Wave et Orange Money** : encore chargés depuis readdy.ai (accueil, fiche machine, checkout). À héberger dans `frontend/public/images/`.
- Le dossier source `Banque d'images_SMA/` (27 Mo) n'est pas suivi par git : décider s'il faut le versionner ou l'ajouter au `.gitignore`. Les versions optimisées (≈ 3 Mo) sont dans `frontend/public/images/`, et les détourages dans `frontend/public/images/cutouts/`.

## 3 bis. Refonte visuelle : à finir

- **Redémarrer le serveur Vite** après la mise à jour : la nouvelle config Tailwind (`font-serif` = Fraunces, couleurs `sma-*`) n'est prise en compte qu'au démarrage.
- La refonte (polices Fraunces / Manrope / ADLaM Display, en-têtes bleu nuit, cartes) couvre le site public. Le **portail admin** et l'**espace client** ont hérité des polices, mais gardent l'ancien style (vert menthe, badges colorés).
- Pages publiques retouchées sur les couleurs et la casse seulement, à reprendre plus en détail : comparateur, demande de devis, panier, checkout, détail produit, détail d'article.

## 4. ~~Upload d'images depuis l'admin~~ ✅ fait le 2026-11-08

- Champ d'envoi (clic ou glisser-déposer, aperçu, erreurs, repli sur une URL) dans les fiches **machine** (plusieurs photos, la première est la principale), **consommable** et **article de blog**.
- La page **Consommables** a maintenant ses fenêtres Ajouter / Modifier / Supprimer (les boutons ne faisaient rien).
- Backend : `helmet` autorise l'affichage cross-origin des `/uploads`, le type MIME est contrôlé. La base garde `/uploads/…` en relatif, le frontend ajoute l'origine de l'API (`utils/media.ts`).
- Corrigé au passage dans la fiche machine : l'ajout échouait (catégorie jamais envoyée), l'enregistrement écrasait la marque par la catégorie et vidait la référence du modèle et l'unité, le résumé modifié n'était pas pris en compte, le stock choisi était ignoré. Le backend renvoie la catégorie après création / modification.
- Vérifié dans Chrome : envoi, refus d'un faux fichier, photo principale, enregistrement, affichage sur la fiche publique ; ajout, modification et suppression d'un consommable ; couverture de blog. Données de test retirées.
- **Reste** : les images retirées d'une fiche restent sur le disque (`backend/uploads/`) ; en production, prévoir un stockage persistant (volume ou stockage objet) pour ce dossier.

## 5. ~~Tests~~ ✅ fait le 2026-11-08

- **Backend** (`npm test`, ~1 min, 227 tests) :
  - unitaires (MySQL simulé) : montants, création de commande, webhooks de paiement, authentification ;
  - **API sur une base de test dédiée** `smalim_test`, recréée à chaque lancement depuis `schema.sql` : **tous les endpoints** (auth, catalogue, envoi d'images, commandes, paiements, devis, clients, parc, tickets, factures, tableaux de bord, blog, paramètres, comptes admin, codes promo), avec les droits de chaque rôle. Aucun email envoyé, aucun prestataire réel, base de travail jamais touchée.
- **Frontend** (`npm test`, Vitest) : calcul du panier, sur les mêmes cas que le backend.
- **Bugs trouvés et corrigés grâce aux tests** :
  - faille de paiement : un prestataire non configuré (simulateur) acceptait des notifications non vérifiées, même en production ; une notification Orange Money pouvait confirmer un paiement Wave ;
  - les machines et consommables **retirés du catalogue restaient visibles** sur le site public ;
  - une machine « sur devis » (prix 0) pouvait être **commandée pour 0 FCFA** via l'API ;
  - modifier une machine ou un produit sans envoyer tous les champs les remettait à NULL (erreur 500) ;
  - supprimer une machine installée chez un client renvoyait une erreur 500 (maintenant 409 avec un message clair) ;
  - blog : une image envoyée depuis l'admin était refusée à l'enregistrement ; **créer un article depuis l'admin échouait toujours** (catégorie jamais envoyée) ; aucun moyen de **publier** un article (tout restait en brouillon malgré le message « publié »).
- **À faire ensuite** : quelques tests de bout en bout dans le navigateur (Playwright) ; lancer les tests automatiquement à chaque push (GitHub Actions, avec un service MySQL).

## 6. ~~Paiement Stripe~~ ✅ décidé le 2026-11-08 : Wave à la place de Stripe (Wave seul pour le moment)

- Stripe abandonné : paquet `@stripe/react-stripe-js` retiré du frontend, `STRIPE_SECRET_KEY` / `VITE_STRIPE_PUBLIC_KEY` retirées de `.env.example` et des CLAUDE.md, mention « Carte bancaire » retirée du devis PDF.
- L'API refuse désormais `payment_method: 'card'` (400). Une ancienne commande « carte » encore en attente se règle par Wave (`POST /api/payments/initiate` la bascule sur Wave). La valeur `card` reste dans l'ENUM de la base et son libellé reste affiché, pour l'historique.
- Les « Carte bancaire » des fiches machines (moyens de paiement acceptés par le distributeur lui-même) ne sont pas concernées.
- **Wave seul pour le moment** (décision du 2026-11-08) : Orange Money n'est plus proposé au checkout et l'API refuse `orange_money` pour une nouvelle commande ; une commande Orange Money encore en attente se règle par Wave. Le code Orange Money (`orangeMoney.provider.js`) et ses webhooks restent en place : pour le réactiver, l'ajouter à `ONLINE_METHODS` (`backend/services/payment/index.js`) et remettre son choix dans `frontend/src/pages/checkout/page.tsx`. Les textes marketing qui citent Orange Money parlent des distributeurs (moyens de paiement acceptés par les machines), pas du site.
- **Intégration Wave complétée** (2026-11-08), d'après la spécification Afro.tools `wave` : devise envoyée en majuscules (`XOF`, elle partait en `xof`) ; webhook authentifié (signature de moins de 5 min, plusieurs `v1`, ou mode `SHARED_SECRET`) puis **contre-vérifié** en relisant la session chez Wave ; rattrapage par `GET /api/payments/status` si le webhook n'arrive pas ; sessions expirées ; signature des requêtes optionnelle (`WAVE_API_SIGNING_SECRET`) ; erreurs Wave traduites en consignes ; diagnostic au démarrage et dans `GET /api/payments/config`.
- **Testé en réel le 2026-11-09** (clé de production, tunnel ngrok) : commande CMD-2026-05044 de 7 FCFA payée avec l'application Wave → webhook `checkout.session.completed` signé et accepté, session relue chez Wave, commande `paid` / `confirmed`, emails envoyés. Un essai à 17 110 FCFA refusé par Wave (solde insuffisant) a été correctement laissé impayé. Ajouté après le test : relance du paiement (« Payer avec Wave » dans l'espace client et sur la page d'échec), avec fermeture de la session précédente chez Wave et signalement d'un éventuel double paiement. Corrigé pendant le test : statut lisible sans connexion au retour de Wave (le client revient souvent dans le navigateur du téléphone), événements sans commande (test du portail, `b2b.*`) acceptés puis ignorés au lieu d'être rejoués 3 jours, journal explicite des notifications.
- **Reste** : supprimer l'ancien webhook en double dans le portail Wave (chaque événement arrive deux fois, l'un signé avec l'ancien secret → 401) ; supprimer ou désactiver le produit de test (id 76) ; annuler la commande de test CMD-2026-22499 (17 110 FCFA ; sa session Wave a expiré) ; en production : hébergement avec IP sortante fixe (liste d'IP autorisées active chez Wave), site en HTTPS, webhook déclaré sur l'adresse définitive.

## 7. ~~Nettoyage du dépôt~~ ✅ fait le 2026-11-08

- Supprimés : les anciennes copies de fichiers du frontend dans `backend/` (`index.html`, `vite.config.ts`, `vite-env.d.ts`, `tailwind.config.ts`, `postcss.config.ts`, `eslint.config.ts`, `tsconfig*.json`), utilisées par aucun script du backend ; la page morte `commande/confirmation` et sa route (l'adresse affiche maintenant la page 404) ; les brouillons `SMA.session.sql` et `backend/SenMartAli.session.sql`. Les `*.session.sql` sont désormais ignorés par git.
- Vérifié : compilation TypeScript, ESLint et build de production ; API démarrée ; dans Chrome, page 404 sur l'ancienne adresse, panier et checkout intacts.
- **Reste de ton côté** : la vidéo `WhatsApp Video 2026-03-29 at 19.18.16.mp4` (6 Mo, ignorée par git) est toujours à la racine : la déplacer ou la supprimer toi-même (elle n'est pas dans git, une suppression serait définitive).
- **Reste** : images encore hébergées chez readdy.ai (accueil, À propos, blog, mocks, logos Wave / Orange Money) à remplacer par des visuels propres à SMALIM (voir aussi §3).

## 8. ~~Messages de contact et newsletter~~ ✅ fait le 2026-11-09

- **Avant** : le formulaire de la page Contact envoyait les messages à un service tiers (`readdy.ai`, l'outil qui a généré le site), jamais au backend ; le bouton « S'inscrire » de la newsletter ne faisait que vider le champ.
- **Maintenant** : messages et inscrits enregistrés en base ; email à l'équipe (Paramètres → Notifications → « Nouveau message de contact ») et accusé de réception au visiteur ; pages admin « Messages » (pastille des non lus, lu / répondu / archivé, note interne, répondre par email ou WhatsApp) et « Newsletter » (liste, désinscription, export CSV) ; lien de désinscription dans l'email de bienvenue ; protection anti-robot et limite de débit. Testé dans le navigateur et par 20 tests d'API.
- **À faire de ton côté** : renseigner l'email de l'équipe dans Paramètres → Notifications (vide en développement : aucune notification ne part) ; récupérer dans ton compte Readdy les messages éventuellement reçus avant ce changement.
- **Plus tard** : envoi de campagnes (aujourd'hui : export CSV vers Brevo / Mailchimp) ; double confirmation de l'inscription si nécessaire.
