# Interface, responsive et états

Ce document décrit la direction visuelle, le comportement sur téléphone, et
surtout ce que l'interface affiche quand tout ne se passe pas comme prévu. Il
correspond à la ligne « UX/UI, responsive & états d'interface » du barème.

Documents liés : [rendu, données et mutations](choix-de-rendu.md) ·
[performance, cache et SEO](performance-cache-seo.md).

## Direction visuelle

Aucune maquette n'était fournie : la direction artistique, les composants et
les états sont les miens. Je n'utilise pas de bibliothèque de composants.

### Couleurs

Les couleurs sont des variables CSS définies une fois dans
`src/app/globals.css`, en clair et en sombre, puis exposées à Tailwind
(`bg-pine`, `text-ink`, `border-line`…). Aucune couleur n'est écrite en dur
dans un composant.

| Variable      | Rôle                                             | Clair     | Sombre    |
| ------------- | ------------------------------------------------ | --------- | --------- |
| `--paper`     | Fond de page                                     | `#ededea` | `#14171a` |
| `--surface`   | Fond des cartes et des champs                    | `#ffffff` | `#1d211f` |
| `--ink`       | Texte                                            | `#171b1f` | `#edeeea` |
| `--ink-muted` | Texte secondaire                                 | `#5b6168` | `#9aa0a6` |
| `--line`      | Bordures                                         | `#d8d4c9` | `#2c322f` |
| `--pine`      | Couleur d'action (boutons, liens, sélection)     | `#24534a` | `#4c9c8b` |
| `--ochre`     | Avertissements                                   | `#8f5a26` | `#d69a57` |
| `--danger`    | Erreurs, actions destructrices, coûts en crédits | `#a3372a` | `#e07a68` |

L'application mobile reprend la même palette et les mêmes polices.

### Typographie

Deux polices, chargées par `next/font/google` dans `src/app/layout.tsx` :
**Fraunces** pour les titres (`font-display`) et **Schibsted Grotesk** pour le
texte (`font-sans`).

### Thème

Clair, sombre, ou celui du système. Le choix est mémorisé dans le navigateur
(`localStorage`). Un script exécuté avant l'affichage pose l'attribut
`data-theme` : la page ne s'affiche jamais brièvement dans le mauvais thème
(`src/lib/theme/`).

### Composants de base

`src/components/ui/` : `Button`, `Input`, `Select`, `Textarea`, `Label`,
`PasswordField`, `FieldError`, `Alert`, `Badge`, `Card`, `StatCard`,
`EmptyState`, `Skeleton`. Les mêmes composants servent au site public, à
l'espace membre et à l'administration, ce qui assure la cohérence entre les
trois.

Icônes : Lucide, jamais d'emoji. Photos : fichiers locaux dans
`public/images/` (Unsplash, licence libre), affichés avec `next/image`.

## Responsive

Le point de bascule principal est `md` (768 px).

| Zone                          | À partir de 768 px             | En dessous                                                                         |
| ----------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| Site public                   | En-tête complet                | Menu déroulant (`(marketing)/_components/mobile-nav.tsx`)                          |
| Espace membre et admin        | Barre latérale fixe (`AppNav`) | Barre d'onglets en bas de l'écran (`AppTabBar`) et bandeau supérieur avec le solde |
| Sous-sections (compte, admin) | Onglets horizontaux            | Onglets horizontaux                                                                |
| Listes et grilles             | 2 à 4 colonnes                 | 1 colonne ; les lignes s'empilent                                                  |

Sur téléphone, les destinations rares (administration, retour au site public,
déconnexion) sont dans la page « Mon compte », parce que la barre d'onglets n'a
de place que pour cinq entrées. Le contenu garde une marge basse pour ne pas
passer sous la barre d'onglets, qui tient compte de la zone de l'indicateur
d'accueil des iPhone (`env(safe-area-inset-bottom)`).

## Les états d'interface

Le sujet demande de prévoir six cas. Voici où chacun est traité.

| Cas du sujet              | Ce que voit l'utilisateur                                          | Où dans le code                                           |
| ------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| **Chargement**            | Un squelette de la page qui arrive, à sa taille réelle             | 24 fichiers `loading.tsx`, `src/components/skeletons.tsx` |
| **Liste vide**            | Un message et une action pour en sortir                            | `EmptyState` (`src/components/ui/empty-state.tsx`)        |
| **Formulaire invalide**   | L'erreur sous le champ, un résumé en toast, les saisies conservées | `FieldError`, `useActionToast`                            |
| **Ressource inexistante** | Une page « introuvable » qui garde la navigation                   | `notFound()` et 3 fichiers `not-found.tsx`                |
| **Accès interdit**        | Une redirection expliquée, ou la page « accès refusé »             | Gardes serveur, `/acces-refuse`                           |
| **Erreur de requête**     | Un écran d'erreur avec un bouton « Réessayer »                     | 5 fichiers `error.tsx`, `ErrorScreen`                     |

### Chargement

Chaque page a son `loading.tsx`. Il est composé des briques de
`src/components/skeletons.tsx` (`SkeletonPage`, `ListSkeleton`,
`StatGridSkeleton`, `FormSkeleton`…) disposées dans le même ordre et aux mêmes
largeurs que la page : le contenu remplace le squelette sans décalage.

J'ai préféré des squelettes à un indicateur tournant : ils montrent ce qui va
arriver et évitent que la mise en page saute.

Pendant une action, le bouton qui l'a lancée est désactivé et son libellé
change (« Enregistrement… », « Localisation… »).

### Liste vide

| Page                            | Message quand il n'y a rien                                                      |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `/lieux`                        | Aucun lieu pour ces filtres, avec un bouton pour les réinitialiser               |
| `/reserver`                     | Aucun espace ne correspond à la recherche                                        |
| `/reservations`                 | Aucune réservation, avec un bouton « Réserver un espace »                        |
| `/arrivees`                     | Aucune arrivée, avec un lien vers les réservations                               |
| `/tableau-de-bord`              | Un encadré « pas de réservation à venir » à la place de la prochaine réservation |
| `/admin`, `/admin/reservations` | Une phrase à la place de la liste                                                |

### Formulaire invalide

Tous les formulaires suivent le même fonctionnement.

1. Le `<form>` porte `noValidate` : ce sont mes messages qui s'affichent, pas
   les bulles du navigateur.
2. La Server Action valide avec zod et renvoie `fieldErrors` : un message par
   champ.
3. `FieldError` affiche le message sous le champ ; `fieldProps()` relie le
   champ à son message (`aria-invalid`, `aria-describedby`), et le champ prend
   une bordure rouge.
4. Un toast résume : le message lui-même s'il n'y a qu'une erreur, « 3 champs
   sont à corriger » s'il y en a plusieurs.
5. Les valeurs saisies sont renvoyées par l'action et réinjectées : une erreur
   n'oblige pas à tout retaper. Un mot de passe n'est jamais renvoyé.

Les messages sont écrits pour dire ce qui ne va pas **et** quoi faire : « Le mot
de passe doit contenir au moins 8 caractères (vous en avez saisi 5) », « Il
vous manque 6 crédits : ce créneau coûte 18 crédits et votre solde est de 12
crédits ».

### Ressource inexistante

| Fichier                     | Quand                                                              |
| --------------------------- | ------------------------------------------------------------------ |
| `src/app/not-found.tsx`     | Une URL qui ne correspond à aucune route                           |
| `(marketing)/not-found.tsx` | Un lieu inconnu (`/lieux/slug-inconnu`) : l'en-tête du site reste  |
| `(app)/not-found.tsx`       | Une réservation, un espace, un utilisateur inconnu : le menu reste |

`notFound()` est appelé dans les sept pages à paramètre dynamique. Une ressource
qui appartient à un autre membre donne la même page qu'une ressource
inexistante.

### Accès interdit

| Situation                                  | Réponse                                                               |
| ------------------------------------------ | --------------------------------------------------------------------- |
| Page de l'espace membre sans être connecté | Redirection vers `/connexion` et toast « Connexion requise »          |
| Espace membre avant la fin de l'onboarding | Redirection vers `/bienvenue`                                         |
| `/admin` avec un compte membre             | Page `/acces-refuse`, qui explique et propose de revenir à son espace |

La page « accès refusé » existe pour qu'un refus ne ressemble pas à un bug :
un simple renvoi silencieux vers l'accueil n'expliquerait rien.

### Erreur de requête

| Fichier                           | Ce qui reste affiché autour de l'erreur        |
| --------------------------------- | ---------------------------------------------- |
| `(app)/error.tsx`                 | Le menu de l'espace membre                     |
| `(app)/tableau-de-bord/error.tsx` | Le menu de l'espace membre                     |
| `(marketing)/error.tsx`           | L'en-tête et le pied de page du site           |
| `src/app/error.tsx`               | Rien : écran autonome (connexion, onboarding…) |
| `src/app/global-error.tsx`        | Rien : remplace le layout racine s'il échoue   |

Tous rendent `ErrorScreen` (`src/components/error-screen.tsx`) : ce qui s'est
passé, un bouton « Réessayer » qui relance le rendu de la page, un lien de
retour, et la référence de l'erreur (`digest`) pour la retrouver dans les
journaux du serveur. Si la connexion est coupée, l'écran le dit.

Les erreurs **prévues** d'une action (solde insuffisant, créneau déjà pris) ne
passent pas par ces écrans : l'action renvoie un message, affiché en toast et
à côté du bouton. Les erreurs **imprévues** d'une action (base injoignable)
sont attrapées par `guardAction` et donnent un message générique, sans quitter
la page.

### Retour après une action

| Situation                  | Mécanisme                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| L'action reste sur la page | Toast par `useActionToast` ou `useRunAction`                                             |
| L'action redirige          | Code dans l'URL (`?ok=…`), toast affiché à l'arrivée par `FlashToast`, puis URL nettoyée |

Toasts (`src/lib/feedback/toast-provider.tsx`) : vert pour un succès, rouge
pour une erreur ; une erreur reste affichée 9 secondes, un succès 4,5
secondes ; trois au plus à l'écran ; deux messages identiques sont fusionnés.

Les actions destructrices demandent une confirmation en deux temps, sans boîte
de dialogue du navigateur : annuler une réservation, supprimer un espace ou un
utilisateur, se déconnecter.

### Hors ligne

Dans l'espace membre, un bandeau apparaît quand le navigateur perd la connexion
(`(app)/_components/offline-banner.tsx`).

## Accessibilité

| Point                | Mise en œuvre                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lien d'évitement     | « Aller au contenu », premier élément focalisable (`src/app/layout.tsx`)                                                                                                        |
| Focus visible        | Contour de 2 px sur `:focus-visible` (`globals.css`)                                                                                                                            |
| Page courante        | `aria-current="page"` sur le lien actif des menus et des onglets                                                                                                                |
| Champs de formulaire | Un `<label>` par champ, `aria-invalid` et `aria-describedby` en cas d'erreur                                                                                                    |
| Annonces             | `role="status"` sur les squelettes et le bandeau hors ligne, `role="alert"` sur l'écran d'erreur, `aria-live` sur les compteurs de résultats et le récapitulatif de réservation |
| Langue               | `<html lang>` suit la langue choisie                                                                                                                                            |
| Mouvement            | Animations neutralisées avec `prefers-reduced-motion`                                                                                                                           |
| Images               | Texte alternatif sur les images porteuses de sens, vide sur les images décoratives                                                                                              |
| Règles de lint       | `eslint-plugin-jsx-a11y`, inclus dans `eslint-config-next`                                                                                                                      |

L'audit Lighthouse donne 100 en accessibilité sur les cinq pages publiques
mesurées. Le premier passage avait relevé trois points (contraste de petits
textes, ordre des titres, lien distingué par sa seule couleur) : je les ai
corrigés. Détail dans
[performance, cache et SEO](performance-cache-seo.md#audit-lighthouse).

## Langues

Le site est disponible en français et en anglais.

- La langue est un cookie (`repere_locale`), posé par `setLocaleAction`.
- `src/lib/i18n/dictionaries/fr.ts` fait référence ; `en.ts` doit avoir
  exactement la même forme, sinon `npm run typecheck` échoue. Une traduction
  oubliée est donc une erreur de compilation, pas un texte manquant à l'écran.
- Les dates et les heures de l'espace membre sont formatées dans le fuseau
  `Europe/Paris` (`src/lib/member/format.ts`), pas dans celui du serveur.
