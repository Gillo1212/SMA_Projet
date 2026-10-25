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
- Volontairement non traduits : `paiement/simulation` (outil de dev), `commande/confirmation` (page morte, voir §7).
- **Limites restantes** :
  - Les messages d'erreur renvoyés par le backend (« Cet email est déjà utilisé », « Email ou mot de passe incorrect »…) restent en français.
  - `machines.service.ts` fabrique des libellés en français : « Sur devis », « Populaire », niveaux de stock.
  - Les données du catalogue (noms, descriptions, catégories, délais) sont en français dans la base.

## 2 bis. ~~Panier : montants incohérents avec le backend~~ ✅ fait le 2026-10-25

- TVA, 3 modes de livraison (actif / tarif) et seuil de livraison standard offerte sont réglables dans **Admin → Paramètres → TVA & livraison**. Codes promo gérés dans **Admin → Paramètres → Codes promo**.
- Panier et checkout calculent comme le backend (`frontend/src/utils/orderTotals.ts`), le code promo est validé par l'API et transmis à la commande, le checkout exige un compte client.
- Vérifié de bout en bout dans Chrome : réglage admin → panier → checkout express + code promo → commande en base identique au franc près.
- ✅ **Page Paramètres entièrement reliée** (2026-10-26) : Administrateurs, Email & SMTP (test réel, mot de passe chiffré), Notifications (commande, devis, client, stock faible), Entreprise (coordonnées affichées sur Contact et À propos), Sécurité. Vérifié dans Chrome (19/19).
- **À faire de ton côté** : saisir les vraies coordonnées dans Paramètres → Entreprise (la page Contact masque les champs vides), et configurer le SMTP dans Paramètres → Email & SMTP (mot de passe d'application Gmail), puis renseigner l'email de réception des notifications.

## Ancien constat (2 bis), pour mémoire

- `pages/panier/page.tsx` offre la livraison au-delà de 50 000 FCFA, et la fiche produit l'annonce (« Livraison gratuite dès 50 000 FCFA »). **Le backend ne connaît pas cette règle** : il facture 0 / 2 500 / 5 000 FCFA selon le mode (`DELIVERY_FEES` dans `orders.controller.js`). Le client voit un total dans le panier, puis un autre au checkout.
- Le panier valide les codes promo avec une liste codée en dur (`BIENVENUE10`, `SMA2026`, `FIRST20`) au lieu d'appeler l'API. (Le message d'erreur, qui affichait les codes valides, est maintenant générique.)
- Le checkout n'exige pas d'être connecté, alors que `POST /orders` le demande : un visiteur anonyme remplit tout le tunnel puis reçoit une erreur. Rediriger vers la connexion client avant l'étape adresse (ou proposer la création de compte, déjà amorcée dans le formulaire).

## 2 quater. Connexion lente (~3 à 4 s)

- `bcryptjs` (JavaScript pur) à 12 tours prend environ 4 s par hachage sur la machine de dev : chaque connexion et inscription attend autant. Passer au paquet natif `bcrypt` (compatible avec les hachages existants), ou mesurer sur le serveur de production avant de décider.
- À faire : décider de la règle de livraison (l'implémenter côté backend, ou retirer la mention), et faire valider les codes promo par l'API.

## 2 ter. Comparateur : données manquantes

- `machines.service.ts` force `capacity: {}` et `maintenanceIncluded: false` : le comparateur affiche « N/A » et « ✗ maintenance » pour toutes les machines.

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

## 4. Upload d'images depuis l'admin

- Le backend expose `POST /api/upload` (renvoie `/uploads/<fichier>`), mais aucun service frontend ne l'appelle : l'admin ne peut pas téléverser d'image pour une machine ou un produit.
- Deux obstacles à lever en même temps :
  - l'URL renvoyée est relative (`/uploads/...`) : servie depuis le port 5173, elle ne pointe pas vers le backend (port 5000). Préfixer avec l'origine de l'API côté frontend, ou ajouter un proxy Vite.
  - `helmet()` est utilisé avec sa config par défaut, qui envoie `Cross-Origin-Resource-Policy: same-origin` : le navigateur bloquera les images `/uploads` chargées depuis un autre port/domaine. Régler `crossOriginResourcePolicy: { policy: 'cross-origin' }`.

## 5. Tests

- Aucun test, ni backend ni frontend.
- Priorités suggérées : calcul des montants de commande (TVA 18 %, frais de port), webhooks de paiement (idempotence, contrôle de montant), auth (login, refresh, reset password).

## 6. Paiement Stripe

- `STRIPE_SECRET_KEY` figure dans `.env.example` mais aucun fournisseur Stripe n'existe dans `backend/services/payment/` (seuls Wave, Orange Money et le simulateur sont codés).
- Décider : implémenter Stripe (paiement par carte) ou retirer la variable et la mention du CLAUDE.md.
- Wave et Orange Money n'ont jamais été testés contre les vraies API : à valider avec les contrats marchands avant la production.

## 7. Nettoyage du dépôt

- `backend/` contient des fichiers qui semblent venir du frontend : `index.html`, `vite.config.ts`, `vite-env.d.ts`, `tailwind.config.ts`, `postcss.config.ts`, `eslint.config.ts`, `tsconfig*.json`. À vérifier puis supprimer.
- Page morte `frontend/src/pages/commande/confirmation/` : plus aucun lien n'y mène depuis le passage au paiement Wave / Orange Money (le checkout redirige vers `/paiement/retour`). À supprimer avec sa route, ou à rebrancher.
- Fichiers SQL de session inutiles : `SMA.session.sql` (racine, vide) et `backend/SenMartAli.session.sql`.
- Vidéo `WhatsApp Video 2026-03-29 at 19.18.16.mp4` (6 Mo) à la racine : ignorée par git, à déplacer ou supprimer.
- Images encore hébergées chez readdy.ai (illustrations de la page d'accueil, de la page À propos, du blog, des mocks) : à remplacer par des visuels propres à SMALIM au fur et à mesure.
