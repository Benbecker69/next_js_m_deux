# Performance, cache et SEO

Ce document décrit la stratégie de cache et son invalidation, les
optimisations d'images et de polices, le référencement, et un audit Lighthouse
interprété. Il correspond à la ligne « Performance, cache, SEO & optimisation »
du barème.

Documents liés : [rendu, données et mutations](choix-de-rendu.md) ·
[interface et états](interface-et-etats.md).

## Stratégie de cache

### Ce qui est mis en cache

Deux lectures, et seulement pour les pages publiques.

| Fonction             | Fichier                     | Tag         | Lue par                                       |
| -------------------- | --------------------------- | ----------- | --------------------------------------------- |
| `getCachedLocations` | `src/lib/data/locations.ts` | `locations` | `/`, `/lieux`, `/lieux/[slug]`, `sitemap.xml` |
| `getCachedSpaces`    | `src/lib/data/spaces.ts`    | `spaces`    | `/`, `/lieux`, `/lieux/[slug]`, `/tarifs`     |

```ts
export const getCachedLocations = unstable_cache(listLocations, ["locations"], {
  tags: ["locations"],
});
```

`unstable_cache` enregistre le résultat de la requête SQL dans le cache de
données de Next.js. Tant que le tag n'est pas invalidé, les visites suivantes
relisent ce résultat sans interroger PostgreSQL.

### Invalidation

Le cache n'a pas de durée d'expiration : il est invalidé **à la demande**, par
la Server Action qui modifie la donnée.

| Action d'administration   | Tag invalidé | Pages d'administration rafraîchies (`revalidatePath`) |
| ------------------------- | ------------ | ----------------------------------------------------- |
| `createLocationAction`    | `locations`  | — (redirection vers le lieu créé)                     |
| `updateLocationAction`    | `locations`  | `/admin/lieux`, `/admin/lieux/[id]`                   |
| `createSpaceAction`       | `spaces`     | `/admin/lieux/[id]`                                   |
| `toggleSpaceStatusAction` | `spaces`     | `/admin/lieux/[id]`                                   |
| `deleteSpaceAction`       | `spaces`     | `/admin/lieux/[id]`                                   |

L'appel est `revalidateTag(tag, "max")`, la signature à deux arguments de
Next.js 16. Avec le profil `max`, la donnée est marquée périmée : la première
visite qui suit reçoit encore l'ancienne version pendant que la nouvelle est
recalculée en arrière-plan, et les visites suivantes reçoivent la nouvelle.
C'est le bon compromis pour un catalogue public : la page reste rapide, et un
léger décalage sur la liste des lieux est acceptable.

Ce décalage ne serait **pas** acceptable pour un solde ou une disponibilité :
c'est pourquoi ces données ne sont pas mises en cache.

### Ce qui n'est pas mis en cache, et pourquoi

| Donnée                                        | Raison                                                    |
| --------------------------------------------- | --------------------------------------------------------- |
| Espace membre (réservations, solde, arrivées) | Propre à chaque membre, doit être exacte à l'instant      |
| Disponibilité d'un espace                     | Change à chaque réservation                               |
| Administration                                | L'administrateur doit voir sa modification immédiatement  |
| Réponses de l'API mobile                      | En-tête `Cache-Control: no-store` sur toutes les réponses |

Les pages elles-mêmes sont rendues à chaque requête : toutes lisent des
cookies (la langue, et la session pour l'en-tête), ce qui les rend dynamiques.
C'est la donnée qui est mise en cache, pas le HTML.

### Invalidation du routeur client

Le layout de l'espace membre affiche le solde de crédits et le nom. Le routeur
de Next.js garde ce layout en mémoire pendant la navigation. Toute action qui
change ce qu'il affiche appelle donc
`revalidatePath("/tableau-de-bord", "layout")` : réservation, annulation,
modification du profil, de l'e-mail, ou des crédits par un administrateur.
Sans cet appel, le menu continuerait d'afficher l'ancien solde.

### Une lecture de session par requête

`getSession()` est enveloppée dans `cache()` de React. Le layout, la page et
l'en-tête appellent tous la session ; l'utilisateur n'est lu qu'une fois en
base par requête.

### Pourquoi `unstable_cache` et pas `"use cache"`

Next.js 16 recommande désormais la directive `"use cache"` (Cache Components) à
la place de `unstable_cache`. Je ne l'ai pas adoptée : elle demande d'activer
Cache Components pour tout le projet et de placer chaque lecture dynamique
(cookies de langue et de session, présents sur toutes les pages) derrière une
frontière `<Suspense>`. `unstable_cache` me donne ce dont j'ai besoin — deux
lectures cachées, invalidées par tag — sans restructurer les pages. C'est une
migration possible, pas une nécessité pour ce projet.

### Limite

Une modification faite directement en base (seed, Prisma Studio) ne passe par
aucune action et n'invalide donc pas le cache : il faut redémarrer le serveur
pour la voir sur les pages publiques.

## Images

- Toutes les photos passent par `next/image` : `LocationPhoto`
  (`src/components/location-photo.tsx`), `SpacePhoto`, et les images des pages
  d'accueil, tarifs et fonctionnalités.
- Les fichiers sont locaux (`public/images/`), entre 44 et 349 Ko à l'origine.
  Next.js les redimensionne selon l'écran et les sert en **AVIF**, ou en WebP
  si le navigateur ne l'accepte pas (`images.formats` dans `next.config.ts`).
  Mesuré sur la photo d'accueil en largeur 750 : 23 Ko en AVIF contre 35 Ko en
  WebP. Chaque taille est encodée une fois puis mise en cache.
- Chaque image déclare `sizes`, pour que le navigateur choisisse la bonne
  largeur (`"(min-width: 768px) 45vw, 100vw"` pour l'image d'accueil).
- Les conteneurs ont un ratio fixe (`aspect-[16/10]`…) : aucune image ne
  décale la page en se chargeant (décalage cumulé mesuré à 0).
- L'image principale d'une page est chargée tout de suite et en priorité
  (`loading="eager"` et `fetchPriority="high"`) ; toutes les autres sont
  chargées en différé. Next.js 16 a déprécié la propriété `priority` : j'écris
  les deux choses qu'elle voulait dire.
- Dans l'image Docker, l'optimisation est faite par `sharp`.

## Polices

`next/font/google` (Fraunces et Schibsted Grotesk) : les polices sont
téléchargées au build et servies par l'application elle-même. Aucune requête
ne part vers un serveur tiers à l'affichage, et la réservation d'espace évite
le saut de texte au chargement.

## JavaScript envoyé au navigateur

- Server Components par défaut : seules les parties interactives sont envoyées
  (voir la [liste des composants client](choix-de-rendu.md#les-composants-client-et-pourquoi-chacun-lest)).
- Leaflet, la bibliothèque de carte, est importée dynamiquement dans un effet
  (`src/components/places-map.tsx`) : elle n'est chargée que sur les pages de
  réservation, et seulement dans le navigateur.
- Les requêtes indépendantes d'une page sont lancées en parallèle
  (`Promise.all`), pour ne pas additionner leurs durées.
- Le build de production utilise la sortie `standalone` : le serveur n'embarque
  que les fichiers réellement importés.

## SEO

| Élément                | Mise en œuvre                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| Titre et description   | Metadata API : `generateMetadata` ou `export const metadata` sur les pages                                  |
| Modèle de titre        | `"%s · Repère"`, défini dans `src/app/layout.tsx`                                                           |
| Métadonnées dynamiques | `/lieux/[slug]` : le titre est le nom du lieu, la description est celle du lieu                             |
| Langue                 | `<html lang="fr">` ou `"en"` selon la langue choisie                                                        |
| `sitemap.xml`          | `src/app/sitemap.ts` : pages publiques + une entrée par lieu, lue en base                                   |
| `robots.txt`           | `src/app/robots.ts` : tout est autorisé sauf l'espace connecté, l'administration et `/qrcode`               |
| Pages à ne pas indexer | `robots: { index: false }` sur les pages « introuvable », « accès refusé » et `/qrcode`                     |
| Contenu rendu serveur  | Le HTML des pages publiques contient déjà le texte et les liens : rien ne dépend du JavaScript pour être lu |
| URL lisibles           | `/lieux/le-chantier-lyon` (slug dérivé du nom)                                                              |
| Filtres partageables   | `/lieux?ville=Lyon&type=salle-reunion`                                                                      |

**Limite** : l'application n'est pas déployée. `SITE_URL`
(`src/lib/site-config.ts`) vaut `https://repere.example.com`, une adresse
d'exemple. C'est elle qui apparaît dans `sitemap.xml`, `robots.txt` et
`metadataBase`. Elle est à remplacer par l'adresse réelle au déploiement.

## Audit Lighthouse

J'ai mesuré, corrigé ce que l'audit relevait, puis mesuré à nouveau.

### Conditions

- Date : 7 octobre 2026. Lighthouse 12.8.2, Chrome 154 sans interface.
- Cible : l'**image Docker de production** (`docker compose up`), sur
  `http://localhost:3000`. Pas le serveur de développement, dont les mesures
  ne sont pas représentatives.
- Profil mobile par défaut de Lighthouse : réseau 4G lent simulé et processeur
  ralenti 4 fois. Une mesure en profil ordinateur pour l'accueil.
- Pages publiques seulement (les pages connectées demandent une session).
- Thème sombre (préférence du système de la machine de mesure).
- Pour la seconde série, chaque page a été ouverte une première fois avant la
  mesure, afin que les images optimisées soient déjà en cache, comme sur un
  serveur en service.

Commande :

```bash
npx lighthouse http://localhost:3000/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new" --output=html --output-path=./lighthouse.html
```

### Résultats après correction

| Page                      | Profil     | Performance | Accessibilité | Bonnes pratiques | SEO | LCP   |
| ------------------------- | ---------- | ----------- | ------------- | ---------------- | --- | ----- |
| `/`                       | mobile     | 97          | 100           | 100              | 100 | 2,6 s |
| `/`                       | ordinateur | 100         | 100           | 100              | 100 | 0,7 s |
| `/lieux`                  | mobile     | 98          | 100           | 100              | 100 | 2,4 s |
| `/lieux/le-chantier-lyon` | mobile     | 98          | 100           | 100              | 100 | 2,4 s |
| `/tarifs`                 | mobile     | 98          | 100           | 100              | 100 | 2,4 s |
| `/connexion`              | mobile     | 99          | 100           | 100              | 100 | 2,3 s |

Mesures de l'accueil en profil mobile :

| Mesure                                   | Avant   | Après   |
| ---------------------------------------- | ------- | ------- |
| Premier affichage de contenu (FCP)       | 0,9 s   | 0,9 s   |
| Plus grand élément affiché (LCP)         | 3,6 s   | 2,6 s   |
| Temps de blocage total (TBT)             | 40 ms   | 50 ms   |
| Décalage cumulé de la mise en page (CLS) | 0       | 0       |
| Poids total de la page                   | 484 Kio | 418 Kio |

### Avant et après

| Page                      | Performance avant → après | Accessibilité avant → après | LCP avant → après |
| ------------------------- | ------------------------- | --------------------------- | ----------------- |
| `/` (mobile)              | 90 → 97                   | 96 → 100                    | 3,6 s → 2,6 s     |
| `/` (ordinateur)          | 100 → 100                 | 96 → 100                    | 0,8 s → 0,7 s     |
| `/lieux`                  | 94 → 98                   | 98 → 100                    | 3,1 s → 2,4 s     |
| `/lieux/le-chantier-lyon` | 98 → 98                   | 100 → 100                   | 2,3 s → 2,4 s     |
| `/tarifs`                 | 91 → 98                   | 100 → 100                   | 3,5 s → 2,4 s     |
| `/connexion`              | 98 → 99                   | 96 → 100                    | 2,3 s → 2,3 s     |

SEO et bonnes pratiques étaient déjà à 100 sur toutes les pages.

### Ce que le premier audit relevait, et ce que j'ai corrigé

| Constat                                                                                                                                                    | Correction                                                                                                      | Fichiers                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| LCP de 3,1 à 3,6 s en mobile : la photo d'en-tête n'avait pas `fetchpriority="high"` (la propriété `priority` de `next/image` est dépréciée en Next.js 16) | `loading="eager"` et `fetchPriority="high"` sur l'image principale de chaque page                               | `(marketing)/page.tsx`, `tarifs/page.tsx`, `fonctionnalites/page.tsx`, `src/components/location-photo.tsx` |
| Sur `/lieux`, l'image principale (la première carte) était chargée en différé                                                                              | La première carte de la liste est chargée tout de suite, les suivantes restent en différé                       | `(marketing)/_components/location-card.tsx`, `(marketing)/lieux/page.tsx`                                  |
| Images plus lourdes que nécessaire                                                                                                                         | Format AVIF activé, WebP en repli                                                                               | `next.config.ts`                                                                                           |
| Contraste de 4,41:1 et 3,95:1 (4,5:1 attendu) sur deux petits textes de la maquette de téléphone                                                           | Textes à pleine opacité, et pastille aux couleurs inversées, avec les mêmes couleurs du thème                   | `(marketing)/_components/phone-mock.tsx`                                                                   |
| Ordre des titres sur `/lieux` : des `<h3>` directement sous le `<h1>`                                                                                      | Les cartes sont des `<h2>` sur `/lieux`, et restent des `<h3>` sur l'accueil où un titre de section les précède | `location-card.tsx` (propriété `headingLevel`)                                                             |
| Lien « Créer un compte » distingué du texte voisin par sa seule couleur                                                                                    | Lien souligné, sur la connexion et sur l'inscription                                                            | `login-form.tsx`, `register-form.tsx`                                                                      |

Par cohérence, j'ai appliqué la correction de contraste aux cartes pleines de
l'espace membre (prochaine réservation, détail d'une réservation, détail d'une
arrivée), qui utilisaient le même réglage d'opacité et que Lighthouse n'avait
pas mesurées.

### Interprétation

**Ce qui est bon.**

- Le serveur répond en 10 à 40 ms et le premier contenu s'affiche en moins
  d'une seconde, même sur réseau lent simulé : c'est l'effet du rendu serveur
  et du cache des lieux et des espaces.
- Le temps de blocage est très faible (50 ms au plus) : peu de JavaScript
  s'exécute au chargement, puisque les pages publiques sont des Server
  Components.
- Le décalage de mise en page est nul sur toutes les pages : les images ont un
  ratio réservé et les polices sont servies par l'application.

**Ce qui reste, et pourquoi je le laisse.**

- Le LCP mobile est autour de 2,4 s : c'est le temps de téléchargement de la
  photo d'en-tête sur un réseau 4G lent simulé. En profil ordinateur il est de
  0,7 s.
- Les pages ne peuvent pas entrer dans le cache de retour arrière du
  navigateur, parce qu'elles sont servies avec `Cache-Control: no-store`.
  C'est la conséquence directe du rendu dynamique (cookies de langue et de
  session), pas un oubli.
- Lighthouse signale la feuille de style comme ressource bloquante (9 Ko) :
  c'est le CSS de la page, nécessaire au premier affichage.

### Ce que l'audit ne couvre pas

- Les pages de l'espace membre et de l'administration.
- Les conditions réelles d'un déploiement (réseau, CDN, distance au serveur) :
  la mesure est locale.
