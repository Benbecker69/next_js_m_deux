# Choix de rendu — server / client / cache

Ce document justifie explicitement, comme demandé par le barème, plusieurs choix
de rendu délibérés dans Repère. Il vit dans `docs/` (suivi par git) plutôt que
dans `CLAUDE.md` : ce dernier est exclu du dépôt (`.git/info/exclude`), donc
invisible en soutenance — seule une doc versionnée peut servir de justificatif.

Chaque section explique _pourquoi_ ce choix précis, pas seulement _lequel_.
Les références `fichier:ligne` pointent vers le code réel au moment de ce commit.

## 1. Server Component par défaut, gardes serveur réelles

**Où** : toute l'app (`(app)` — qui héberge aussi `/admin`, `(onboarding)`) ; le
mécanisme central est `src/lib/auth/session.ts:34-48` (`requireUser` /
`requireAdmin` / `requireOnboarded`).

**Choix** : chaque layout protégé appelle une de ces fonctions _côté serveur_,
avant que la moindre donnée protégée ne soit lue, plutôt que de masquer du
contenu côté client après coup.

**Pourquoi** : une garde client (un `if (!user) return null` dans un composant)
n'empêche jamais la requête réseau initiale de renvoyer les données au
navigateur — elle ne fait que cacher visuellement un résultat déjà livré,
inspectable dans l'onglet Réseau. Une garde serveur redirige (`redirect()`)
avant même que la requête aux données protégées ne parte. C'est la différence
entre « l'UI ne montre rien » et « le serveur n'a rien envoyé ».

## 2. Client Component — `SpaceBrowser`

**Où** : `src/app/(app)/reserver/_components/space-browser.tsx:15-18`.

**Choix** : `"use client"` sur ce composant précis (pas sur la page `/reserver`
qui l'englobe).

**Pourquoi** : deux APIs strictement navigateur, impossibles à exécuter côté
serveur — le filtrage texte en direct à la frappe (`useState` + re-render à
chaque caractère) et la `Geolocation API` du navigateur pour le tri « autour de
moi ». Aucune des deux n'a d'équivalent serveur ; le reste de la page
(récupération des espaces, mise en page) reste un Server Component classique.

## 3. Client Component — `AppNav`

**Où** : `src/app/(app)/_components/app-nav.tsx`.

**Choix** : composant feuille client isolé dans le layout `(app)`, qui reste
lui-même un Server Component.

**Pourquoi** : mettre en surbrillance le lien actif demande de connaître l'URL
_du point de vue du routeur client_ (`usePathname()`), qui doit rester
synchronisé avec les navigations côté client sans recharger toute la page —
une info que seul le client possède en temps réel.

## 4. Client Component — `ThemeProvider`

**Où** : `src/lib/theme/theme-provider.tsx`.

**Choix** : Context React + `useSyncExternalStore` (pas `useState`/`useEffect`,
pour éviter une violation de la règle ESLint `react-hooks/set-state-in-effect`
et un flash du mauvais thème).

**Pourquoi** : la préférence de thème vit dans `localStorage`, une API
navigateur, et doit être lue par un Context disponible sur toutes les pages —
un Server Component ne peut ni lire `localStorage` ni exposer un Context à des
enfants qu'il ne contrôle pas au rendu. Le flash initial est évité séparément
par un `<script>` bloquant inline (`theme-script.ts`) qui pose l'attribut
`data-theme` avant l'hydratation.

## 5. Cache — `unstable_cache` + `revalidateTag` sur les pages publiques

**Où** : `src/lib/data/locations.ts:13-21` et `spaces.ts` (motif identique),
consommé par `(marketing)/page.tsx`, `(marketing)/lieux/page.tsx`,
`(marketing)/lieux/[slug]/page.tsx` et `sitemap.ts` ; invalidé dans les Server
Actions admin (`admin/lieux/**/_actions.ts`) via `revalidateTag(tag, "max")`.

**Choix** : mise en cache manuelle par tag (le modèle « stable » de Next.js),
plutôt que la directive `"use cache"` / le flag global `cacheComponents`
(Cache Components / PPR).

**Pourquoi** : le header marketing (`SiteHeader`) lit la session à chaque
requête (`getSession()`) pour afficher soit « Se connecter », soit l'avatar de
l'utilisateur connecté — donc l'arbre entier est dynamique par défaut. Activer
`cacheComponents` globalement aurait exigé de restructurer une quinzaine de
routes derrière des limites `<Suspense>` pour isoler ce qui peut réellement
être statique, un chantier disproportionné à ce stade. `unstable_cache` cible
précisément les deux lectures qui doivent être rapides et publiques
(la liste des lieux et des espaces), sans toucher au reste de l'app — les
pages membre et `/admin` (toutes deux sous `(app)`) continuent de lire les
données sans cache, pour qu'une modification admin soit visible immédiatement
pour l'admin lui-même.
**Vérifié** en build de production (`next build && next start`) : le
comportement de cache/invalidation diffère en `next dev`, conformément à ce
que documente Next.js lui-même sur le rendu en développement.
