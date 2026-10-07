# Rendu, données et mutations

Ce document explique où le code s'exécute (serveur ou navigateur), comment les
données sont lues et modifiées, et pourquoi. Il correspond à la ligne « Data,
Server Components, Server Actions & Route Handlers » du barème, et à
l'exigence « justifier au moins trois choix de rendu ».

Documents liés : [architecture](architecture.md) ·
[performance, cache et SEO](performance-cache-seo.md) ·
[authentification et sécurité](authentification-et-securite.md).

## La règle que je suis

**Tout est Server Component par défaut.** Un fichier ne reçoit `"use client"`
que s'il a besoin du navigateur : un état local, un événement, une API du
navigateur (géolocalisation, `localStorage`, `usePathname`). Aucune page et
aucun layout n'est un composant client : c'est toujours un composant feuille.

Conséquences concrètes :

- les données sont lues sur le serveur, au plus près de la base, sans API
  intermédiaire ;
- les secrets (`DATABASE_URL`) et le code d'accès aux données ne partent
  jamais dans le navigateur ;
- le JavaScript envoyé au navigateur se limite aux parties interactives.

## Les composants client, et pourquoi chacun l'est

40 fichiers portent `"use client"`. Je les classe par raison.

| Raison                                                  | Fichiers                                                                                                                                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formulaire relié à une Server Action (`useActionState`) | `login-form`, `register-form`, `onboarding-form`, `profile-form`, `preferences-form`, `security-forms`, `location-form`, `user-form`, `spaces-manager`, `booking-picker`           |
| Bouton qui appelle une Server Action                    | `cancel-reservation-button` (membre et admin), `arrival-card`, `near-me-card`, `locale-switcher`                                                                                   |
| API du navigateur                                       | `space-browser` (filtre à la frappe, géolocalisation), `places-map` (Leaflet lit `window`), `use-geo-permission`, `use-online`, `offline-banner`, `theme-provider`, `theme-toggle` |
| URL courante connue du routeur client                   | `app-nav`, `admin-tabs`, `settings-tabs`, `nav-links`, `flash-toast`                                                                                                               |
| État d'interface local                                  | `mobile-nav` (menu ouvert ou fermé), `month-calendar`, `logout-confirm` (confirmation en deux temps), `password-field` (afficher / masquer), `toast-provider`                      |
| Imposé par Next.js                                      | les cinq `error.tsx` / `global-error.tsx` et `error-screen` (une frontière d'erreur est toujours un composant client)                                                              |
| Hooks partagés                                          | `use-action-toast`, `use-run-action`                                                                                                                                               |

## Choix de rendu justifiés

Le sujet demande au moins trois choix justifiés : un rendu serveur, une zone
interactive client, une donnée cachée ou explicitement dynamique. En voici six.

### 1. Rendu serveur — la liste des lieux filtrée par l'URL

**Où** : `src/app/(marketing)/lieux/page.tsx`.

**Choix** : les filtres « ville » et « type » sont dans l'URL
(`/lieux?ville=Lyon&type=salle-reunion`). La page lit `searchParams` et filtre
sur le serveur ; les filtres sont de simples liens.

**Pourquoi** : aucun état client n'est nécessaire. Une vue filtrée peut être
partagée ou mise en favori, la recherche de la page d'accueil (un formulaire
`GET`) arrive directement sur la bonne vue, et la page fonctionne sans
JavaScript. Une valeur inconnue dans l'URL est ignorée au lieu d'être crue.

Le même principe sert à `/reservations?vue=…`, `/arrivees?jour=…` et
`/admin/reservations?status=…`.

### 2. Rendu serveur — les gardes d'accès

**Où** : `src/lib/auth/session.ts`, appelé par les layouts, les pages et les
actions.

**Choix** : la vérification de session et de rôle se fait sur le serveur, et
redirige avant de lire la moindre donnée protégée.

**Pourquoi** : masquer un bouton côté client n'empêche pas la réponse de
contenir les données. Avec une garde serveur, un visiteur non autorisé ne
reçoit rien. Détail dans
[authentification et sécurité](authentification-et-securite.md).

### 3. Zone interactive client — le navigateur d'espaces

**Où** : `src/app/(app)/reserver/_components/space-browser.tsx`.

**Choix** : `"use client"` sur ce composant seulement. La page `/reserver`
reste un Server Component : elle lit les espaces, les lieux et lesquels sont
occupés, puis passe le tout en props.

**Pourquoi** : trois besoins que seul le navigateur peut satisfaire — filtrer à
chaque frappe sans aller-retour serveur, lire la position par la Geolocation
API pour trier par distance, afficher une carte. La liste est petite (12
espaces dans les données de démonstration) : la filtrer en mémoire est plus
simple et plus rapide qu'une requête par frappe.

### 4. Zone interactive client — le sélecteur de créneau

**Où** : `src/app/(app)/reserver/[spaceId]/_components/booking-picker.tsx`.

**Choix** : le calendrier, l'heure de début et l'heure de fin sont un état
local ; la confirmation est un `<form>` dont l'action est une Server Action.
Trois champs cachés portent `spaceId`, `startAt` et `endAt`.

**Pourquoi** : choisir un jour puis des heures est une suite de clics qui doit
répondre immédiatement. En revanche la décision appartient au serveur : le
sélecteur ne fait que **proposer**. `createReservationAction` revérifie les
heures d'ouverture, la date, le solde et le chevauchement, puis écrit dans une
transaction. J'ai testé en modifiant les champs cachés avant l'envoi pour
demander un créneau à 7 h : l'action l'a refusé. Le serveur n'envoie au
sélecteur que le début et la fin des créneaux déjà pris, jamais qui a réservé.

### 5. Donnée cachée — les lieux et les espaces des pages publiques

**Où** : `getCachedLocations` (`src/lib/data/locations.ts`) et
`getCachedSpaces` (`src/lib/data/spaces.ts`), lus par `/`, `/lieux`,
`/lieux/[slug]`, `/tarifs` et `sitemap.xml`.

**Choix** : `unstable_cache` avec les tags `locations` et `spaces`. Les Server
Actions d'administration invalident le tag concerné avec
`revalidateTag(tag, "max")`.

**Pourquoi** : ce sont les deux lectures les plus fréquentes du site public et
elles changent rarement (seulement quand un administrateur modifie un lieu ou
un espace). Les mettre en cache évite une requête SQL par visite, et
l'invalidation par tag garantit qu'une modification apparaît sans attendre une
durée d'expiration. Le tableau des invalidations est dans
[performance, cache et SEO](performance-cache-seo.md).

J'ai choisi `unstable_cache` plutôt que la directive `"use cache"` (Cache
Components) : toutes les pages lisent des cookies (langue, session) et sont
donc rendues à chaque requête. Activer Cache Components aurait demandé de
restructurer les pages derrière des frontières `<Suspense>`. `unstable_cache`
cible exactement les deux lectures utiles, sans toucher au reste.

### 6. Donnée explicitement dynamique — l'espace connecté et le plan du site

**Où** : toutes les pages sous `(app)`, `src/app/sitemap.ts`
(`export const dynamic = "force-dynamic"`), et
`src/app/api/mobile/v1/health/route.ts`.

**Choix** : l'espace membre et l'administration lisent la base **sans cache**
(`listLocations`, `listSpaces`, `listReservations`…). Le plan du site est
généré à chaque requête.

**Pourquoi** : un solde de crédits, une disponibilité ou une liste de
réservations doivent être exacts à l'instant de la lecture ; un administrateur
doit voir sa modification immédiatement. Pour le plan du site, la liste des
lieux vient de la base : le figer au build aurait rendu le build dépendant de
la base (impossible dans `docker build`) et aurait manqué les lieux ajoutés
ensuite.

### Deux autres choix qui méritent une phrase

- **Le thème** (`src/lib/theme/theme-provider.tsx`) lit `localStorage` avec
  `useSyncExternalStore`, et un script exécuté avant l'hydratation
  (`theme-script.ts`) pose l'attribut `data-theme` : pas de flash du mauvais
  thème au chargement.
- **Le lien actif du menu** (`(app)/_components/app-nav.tsx`) a besoin de
  `usePathname()` : c'est le seul morceau client du layout de l'espace membre.

## Lecture des données

Les pages lisent la base directement, en appelant les fonctions de
`src/lib/data/` (ou `src/lib/mobile/` pour l'espace membre). Il n'y a ni
`fetch` côté client, ni `useEffect` de chargement, ni route d'API interne pour
le site.

- **En parallèle quand c'est possible.** Les lectures indépendantes sont
  lancées ensemble avec `Promise.all`, par exemple dans
  `(app)/reserver/page.tsx` (session, espaces, lieux, dictionnaire, paramètres
  d'URL, disponibilités).
- **Une seule lecture de session par requête.** `getSession()` est enveloppée
  dans `cache()` de React : le layout et la page appellent tous deux la garde,
  mais l'utilisateur n'est lu qu'une fois en base.
- **Seul le nécessaire passe au client.** `(app)/reserver/[spaceId]/page.tsx`
  ne transmet au sélecteur que `{ startAt, endAt }` pour chaque créneau pris.

### Ce qui traverse la frontière serveur → client

Un composant client ne peut recevoir que des données sérialisables.

- Les **libellés traduits** : `getT()` ne fonctionne que sur le serveur (il lit
  un cookie). La page lit le dictionnaire et passe la section utile en props
  (`t={t.booking}`).
- Les **icônes** : un composant Lucide n'est pas sérialisable. Le composant
  client choisit lui-même l'icône à partir d'une clé (la table `ICONS` de
  `app-nav.tsx`, indexée par `href`).
- Une **Server Action** peut être passée en props, y compris avec un argument
  déjà lié : `updateLocationAction.bind(null, location.id)` dans
  `admin/lieux/[id]/page.tsx`.

## Mutations : les Server Actions

Toutes les écritures du site passent par des Server Actions, rangées dans le
fichier `_actions.ts` de la route concernée. Il y en a 20.

| Fichier                                     | Actions                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `(auth)/connexion/_actions.ts`              | `loginAction`                                                                               |
| `(auth)/inscription/_actions.ts`            | `registerAction`                                                                            |
| `(onboarding)/profil/_actions.ts`           | `completeOnboardingAction`                                                                  |
| `(app)/reserver/_actions.ts`                | `findNearestSpaceAction`                                                                    |
| `(app)/reserver/[spaceId]/_actions.ts`      | `createReservationAction`                                                                   |
| `(app)/reservations/[id]/_actions.ts`       | `cancelReservationAction`, `checkInAction`                                                  |
| `(app)/parametres/profil/_actions.ts`       | `updateProfileAction`                                                                       |
| `(app)/parametres/preferences/_actions.ts`  | `updatePreferencesAction`                                                                   |
| `(app)/parametres/securite/_actions.ts`     | `changeEmailAction`, `changePasswordAction`                                                 |
| `(app)/admin/lieux/nouveau/_actions.ts`     | `createLocationAction`                                                                      |
| `(app)/admin/lieux/[id]/_actions.ts`        | `updateLocationAction`, `createSpaceAction`, `toggleSpaceStatusAction`, `deleteSpaceAction` |
| `(app)/admin/utilisateurs/[id]/_actions.ts` | `updateUserAdminAction`, `deleteUserAdminAction`                                            |
| `(app)/admin/reservations/[id]/_actions.ts` | `adminCancelReservationAction`                                                              |
| `src/lib/i18n/actions.ts`                   | `setLocaleAction`                                                                           |

### Toutes ont la même forme

```ts
export async function updateProfileAction(_prevState, formData) {
  const user = await requireOnboarded();                 // 1. garde
  const parsed = profileFormSchema.safeParse({ … });     // 2. validation zod
  if (!parsed.success) return { ...validationFailure(parsed.error), … };

  return guardAction(async () => {                       // 3. imprévus attrapés
    const updated = await updateUser(user.id, { … });    // 4. écriture
    if (!updated) return { error: MESSAGES.notSaved, … };
    revalidatePath("/tableau-de-bord", "layout");        // 5. invalidation
    return { error: null, success: true };               // 6. résultat
  }, (error) => ({ error, success: false }));
}
```

1. **La garde d'abord.** Une Server Action est un point d'entrée HTTP : elle
   peut être appelée sans passer par la page. Chaque action vérifie donc
   elle-même la session et le rôle.
2. **La validation ensuite**, avec un schéma zod de `src/lib/validation/`.
   Chaque règle porte sa phrase en français.
3. **`guardAction`** (`src/lib/feedback/guard-action.ts`) attrape ce qui n'est
   pas prévu (base injoignable, par exemple) et renvoie un message clair au
   lieu de la page d'erreur. Il laisse passer `redirect()` et `notFound()`, qui
   fonctionnent en levant une exception.
4. **L'écriture** passe par les fonctions de `src/lib/data/`.
5. **L'invalidation** : `revalidatePath` pour les pages concernées,
   `revalidateTag` quand une donnée cachée change.
6. **Le résultat est une valeur, pas une exception.** En production Next.js
   remplace le message d'une erreur levée par une action par un message
   générique. Pour qu'un message comme « Il vous manque 6 crédits » arrive
   jusqu'au membre, l'action le **renvoie**.

### Deux formes de résultat

Définies dans `src/lib/feedback/action-result.ts`.

| Type d'action                         | Résultat                                                           | Côté client             |
| ------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Formulaire (`useActionState`)         | `{ error, fieldErrors?, values?, success? }`                       | `useActionToast(state)` |
| Bouton (annuler, supprimer, basculer) | `ActionResult` : `{ ok: true, message }` ou `{ ok: false, error }` | `useRunAction()`        |

- `fieldErrors` : un message par champ, affiché sous le champ.
- `values` : les valeurs saisies sont renvoyées pour que le formulaire ne se
  vide pas après une erreur (jamais un mot de passe).
- Après un `redirect()`, l'action ne peut plus afficher de toast (la page a
  changé). Elle ajoute un code à l'URL avec `withFlash(path, code)` ; le
  composant `FlashToast` l'affiche à l'arrivée puis nettoie l'URL
  (`src/lib/feedback/flash-messages.ts`).

## Route Handlers, et pourquoi

Le sujet demande un Route Handler **avec justification**. Le projet en contient
deux familles.

### `POST /deconnexion`

**Où** : `src/app/(auth)/deconnexion/route.ts`.

**Pourquoi un Route Handler** : la déconnexion n'a ni champ ni résultat à
afficher sur place. Elle est déclenchée par un simple
`<form action="/deconnexion" method="post">`, présent à plusieurs endroits
(en-tête public, menu membre, page « Mon compte »). Un Route Handler donne une
URL stable à ce formulaire, qui fonctionne même si le JavaScript de la page
n'est pas chargé.

**Pourquoi `POST`** : un lien `GET` pourrait être préchargé par le navigateur
ou suivi par un robot, et déconnecter l'utilisateur sans qu'il l'ait demandé.

**Détail** : la réponse est une redirection `303` avec un en-tête `Location`
**relatif**. Dans l'image Docker le serveur écoute sur `0.0.0.0` ; une URL
absolue construite à partir de `request.url` renvoyait le navigateur vers
`http://0.0.0.0:3000`, qu'il ne peut pas ouvrir.

### `/api/mobile/v1/*`

**Où** : `src/app/api/mobile/v1/**/route.ts` (15 fichiers, 17 points d'entrée).

**Pourquoi des Route Handlers** : le client est une application native, pas un
navigateur. Elle n'a ni cookies du site, ni formulaires, ni rendu React : elle
échange du JSON avec un jeton dans l'en-tête `Authorization`. Une Server
Action est un point d'entrée interne à Next.js, lié au rendu et à des
identifiants générés au build : ce n'est pas un contrat qu'un client externe
peut appeler de façon stable. Un Route Handler, lui, est un contrat HTTP
explicite (méthode, URL, statut, JSON).

Chaque handler est court et suit le même modèle : `handle()` →
`requireMobileUser()` → validation zod → une fonction de `src/lib/mobile/` →
`json()`. Le contrat est décrit dans [api-mobile.md](api-mobile.md).

### Ce que le site et l'API partagent

L'espace membre du site appelle **les mêmes fonctions serveur** que l'API
mobile :

- pour lire : `listReservations`, `getReservation`, `listCheckIns`,
  `getMemberSummary`, `listNearbySpaces` ;
- pour écrire : `createReservation`, `cancelReservation` et
  `performCheckIn`, qui font chacune leur travail dans une transaction.

Le site les appelle directement depuis ses Server Components et ses Server
Actions ; l'application passe par HTTP. Les deux affichent donc les mêmes
chiffres et appliquent les mêmes règles, écrites une seule fois.

## Ce que je n'utilise pas

- **`proxy.ts`** (le sujet dit « si utile ») : les gardes sont dans les
  layouts, les pages et les actions, là où la donnée est lue. Je n'ai pas eu
  besoin d'une interception globale.
- **Cache Components / `"use cache"`** : voir le choix 5.
- **`<Suspense>` par section** : les états de chargement sont des fichiers
  `loading.tsx` (un par page), que Next.js transforme en frontière Suspense
  autour de la page. Le seul `<Suspense>` écrit à la main entoure `FlashToast`
  dans le layout racine, parce que `useSearchParams` l'exige.
