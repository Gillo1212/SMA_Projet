# TODO — SMALIM

Reste à faire, relevé le 2026-10-20. À traiter plus tard, par ordre de priorité.

## 1. Inscription client non branchée (bloquant)

- La route backend `POST /api/auth/client/register` existe et fonctionne.
- Côté frontend, `frontend/src/pages/inscription/page.tsx` (ligne ~60) contient un `TODO` : la page simule un délai de 1,5 s puis redirige vers `/confirmation-email` **sans créer de compte**.
- `frontend/src/services/auth.service.ts` n'expose pas de fonction `register`.
- À faire : ajouter `register()` au service d'auth, l'appeler depuis la page, afficher les erreurs renvoyées par l'API (email déjà utilisé, validation).

## 2. Internationalisation FR/EN incomplète

- Travail en cours non commité dans le dépôt `frontend/` : `About.tsx`, `Features.tsx`, `Testimonials.tsx`, `machines/detail/page.tsx` + nouveaux fichiers `i18n/local/{fr,en}/machineDetail.ts` et `marketing.ts`. **À commiter.**
- Pages qui n'utilisent pas encore `useTranslation` :
  - `pages/about/page.tsx`
  - `pages/home/page.tsx`
  - `pages/NotFound.tsx`
  - `pages/confirmation-email/page.tsx`
  - `pages/admin/page.tsx`, `pages/admin/parametres/page.tsx`
  - `pages/admin/components/AdminSidebar.tsx`
  - `pages/admin/blog/components/DeleteModal.tsx`, `pages/admin/machines/components/DeleteModal.tsx`
  - `pages/espace-client/commandes/page.tsx`, `factures/page.tsx`, `machines/page.tsx`
- Les messages d'erreur codés en dur (ex. « Les mots de passe ne correspondent pas. » dans l'inscription) sont aussi à traduire.

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
- Fichiers SQL de session inutiles : `SMA.session.sql` (racine, vide) et `backend/SenMartAli.session.sql`.
- Vidéo `WhatsApp Video 2026-03-29 at 19.18.16.mp4` (6 Mo) à la racine : ignorée par git, à déplacer ou supprimer.
- Images encore hébergées chez readdy.ai (illustrations de la page d'accueil, de la page À propos, du blog, des mocks) : à remplacer par des visuels propres à SMALIM au fur et à mesure.
