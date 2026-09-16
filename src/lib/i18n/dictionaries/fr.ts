/**
 * Source-of-truth dictionary — French, the app's default and native
 * language. `en.ts` mirrors this exact shape (enforced via `satisfies`),
 * so a key added here that's forgotten in en.ts is a type error, not a
 * silently-missing translation at runtime.
 */
export const fr = {
  common: {
    login: "Se connecter",
    bookSpace: "Réserver un espace",
    logout: "Déconnexion",
    backToHome: "Retour à l'accueil",
    seeLocations: "Voir les lieux",
    skipToContent: "Aller au contenu",
    siteTitle: "Repère — réservez votre espace de coworking",
    siteDescription:
      "Repère, la plateforme pour trouver et réserver un espace de coworking près de chez vous.",
  },
  nav: {
    features: "Fonctionnalités",
    pricing: "Tarifs",
    locations: "Lieux",
    mobileVision: "Vision mobile",
    faq: "FAQ",
  },
  footer: {
    tagline: "Trouvez et réservez un espace de coworking près de chez vous.",
    copyright: "© 2026 Repère. Tous droits réservés.",
  },
  home: {
    heroTitlePrefix: "Un bureau, pas une adresse à ",
    heroTitleEmphasis: "deviner.",
    heroSubtitle:
      "Repère référence des espaces de coworking dans toute la France et vous laisse réserver un bureau, une salle ou un poste flex pour la journée, en quelques clics.",
    howItWorks: "Comment ça marche",
    steps: [
      {
        title: "Cherchez",
        description:
          "Filtrez les lieux par ville, type d'espace et disponibilité du jour.",
      },
      {
        title: "Réservez",
        description:
          "Choisissez un créneau : l'espace est bloqué immédiatement, pas de surprise sur place.",
      },
      {
        title: "Travaillez",
        description: "Présentez-vous à l'accueil, votre réservation est déjà confirmée.",
      },
    ],
    loungeAlt: "Un espace de coworking lumineux, avec des plantes et des fauteuils.",
    featuredTitle: "Quelques lieux",
    seeAll: "Tout voir",
    finalTitle: "Votre bureau du jour, réservé en moins de deux minutes.",
    createAccount: "Créer un compte",
  },
  features: {
    title: "Fonctionnalités",
    subtitle:
      "De la recherche d'un bureau à la gestion d'un lieu, ce que Repère permet aujourd'hui.",
    items: [
      {
        title: "Recherche et réservation",
        description:
          "Filtrez les lieux par ville, type d'espace et disponibilité. Triez par distance grâce à la géolocalisation de votre navigateur. Un créneau réservé est bloqué immédiatement.",
      },
      {
        title: "Tableau de bord et historique",
        description:
          "Vos réservations à venir et passées, vos crédits restants, et l'annulation en un clic tant que le créneau n'a pas commencé.",
      },
      {
        title: "Back-office pour les lieux",
        description:
          "Chaque lieu référencé dispose d'un espace de gestion : disponibilités, réservations, utilisateurs, statistiques d'occupation.",
      },
      {
        title: "Pensé pour le mobile",
        description:
          "Une application mobile est en préparation : badge NFC pour l'accès aux lieux, géolocalisation en temps réel pour trouver un espace libre autour de vous.",
      },
    ],
  },
  pricing: {
    title: "Tarifs",
    subtitle:
      "Repère fonctionne par crédits. Chaque réservation consomme des crédits selon le type d'espace et sa durée — pas d'abonnement obligatoire.",
    costByType: "Coût par type d'espace",
    spaces: [
      {
        type: "Poste flex",
        price: "4 crédits / heure",
        detail: "Un bureau parmi d'autres, dans l'espace commun.",
      },
      {
        type: "Phone booth",
        price: "3 crédits / heure",
        detail: "Cabine insonorisée pour un appel ou une visio.",
      },
      {
        type: "Bureau privé",
        price: "8 à 9 crédits / heure",
        detail: "Un bureau fermé, pour une personne.",
      },
      {
        type: "Salle de réunion",
        price: "17 à 22 crédits / heure",
        detail: "De 4 à 6 personnes selon le lieu.",
      },
    ],
    howToGetCredits: "Comment obtenir des crédits",
    packs: [
      {
        name: "À la carte",
        credits: "Crédits achetés à l'unité",
        price: "1 crédit = 1 €",
      },
      { name: "Pack 100", credits: "100 crédits, valables 6 mois", price: "90 €" },
      {
        name: "Abonnement mensuel",
        credits: "150 crédits reconduits chaque mois",
        price: "120 € / mois",
      },
    ],
  },
  faq: {
    title: "Questions fréquentes",
    metaDescription:
      "Questions fréquentes sur Repère : crédits, annulation, lieux partenaires.",
    questions: [
      {
        question: "Comment fonctionnent les crédits ?",
        answer:
          "Chaque réservation consomme un nombre de crédits selon le type d'espace et la durée. Vous achetez des crédits à l'unité ou via un abonnement mensuel — voir la page Tarifs.",
      },
      {
        question: "Puis-je annuler une réservation ?",
        answer:
          "Oui, tant que le créneau n'a pas commencé, depuis votre historique de réservations. Les crédits sont recrédités automatiquement.",
      },
      {
        question: "Les lieux sont-ils vérifiés ?",
        answer:
          "Chaque lieu est ajouté manuellement par l'équipe Repère après une visite, avant d'être publié sur la plateforme.",
      },
      {
        question: "Y a-t-il une application mobile ?",
        answer:
          "Une application est en préparation. Elle utilisera le NFC pour l'accès aux lieux et la géolocalisation pour repérer un espace libre à proximité — pas une simple copie du site.",
      },
      {
        question: "Comment référencer mon lieu sur Repère ?",
        answer:
          "Écrivez-nous depuis votre espace compte une fois inscrit : nous organisons une visite avant toute mise en ligne.",
      },
      {
        question: "Mes données sont-elles protégées ?",
        answer:
          "Vos informations de compte et vos réservations ne sont visibles que par vous et par les administrateurs du lieu concerné.",
      },
    ],
  },
  locations: {
    title: "Les lieux",
    metaDescription:
      "Tous les espaces de coworking référencés par Repère, ville par ville.",
    subtitle: "lieux référencés pour l'instant, ajoutés un par un après visite.",
    startingFrom: "À partir de",
    perHour: "crédits / heure",
    backToAll: "← Tous les lieux",
    availableSpaces: "Espaces disponibles",
    amenities: "Équipements",
    bookHere: "Réserver un espace ici",
  },
  visionMobile: {
    metaDescription:
      "Ce que l'application mobile Repère permettra : badge NFC à l'entrée des lieux et géolocalisation en temps réel pour trouver un espace libre.",
    badge: "En préparation",
    title: "L'app mobile, pensée avant d'être codée.",
    subtitlePrefix: "Deux usages sont prévus pour l'application mobile Repère : ",
    subtitleEmphasis:
      "badger à l'entrée d'un lieu et repérer l'espace libre le plus proche en temps réel",
    subtitleSuffix: ". Voici comment ça fonctionnera.",
    nfcTitle: "Badge NFC à l'entrée",
    nfcDescription:
      "Un simple contact du téléphone sur le lecteur du lieu confirme votre réservation et déverrouille l'accès — plus besoin de présenter quoi que ce soit à l'accueil.",
    geoTitle: "Espaces libres autour de vous",
    geoDescription:
      "Une fois dans le lieu, l'app localise en temps réel les postes et bureaux encore disponibles, plutôt qu'une liste figée à l'étage.",
    comparisonTitle: "Ce qui existe déjà, ce qui reste à construire",
    todayTitle: "Déjà réel, dans le navigateur",
    todayDescription:
      "Le tri « autour de moi » sur la page de réservation utilise votre position GPS réelle (Geolocation API du navigateur) pour classer les lieux par distance. Aucune maquette : le calcul de distance tourne pour de vrai.",
    tomorrowTitle: "En préparation, côté application mobile",
    tomorrowDescription:
      "Le badge NFC à l'entrée d'un lieu et le suivi de position en continu demandent une application native ou PWA installée, avec accès matériel au lecteur NFC du téléphone. Cette page en présente le principe ; l'intégration viendra dans une phase ultérieure du projet.",
    exploreCta: "Voir les lieux dès maintenant",
  },
  auth: {
    loginTitle: "Connexion",
    loginSubtitle: "Accédez à votre espace Repère.",
    demoAccountsLabel: "Comptes de démonstration",
    demoAdmin: "Admin",
    demoMember: "Membre",
    email: "E-mail",
    password: "Mot de passe",
    loginCta: "Se connecter",
    loginPending: "Connexion…",
    noAccount: "Pas encore de compte ?",
    signupLink: "Créer un compte",
    registerTitle: "Créer un compte",
    registerSubtitle: "20 crédits offerts à l'inscription pour commencer.",
    name: "Nom",
    registerCta: "Créer un compte",
    registerPending: "Création…",
    hasAccount: "Déjà un compte ?",
    loginLink: "Se connecter",
  },
  errors: {
    notFoundMetaTitle: "Page introuvable",
    notFoundCode: "404",
    notFoundTitle: "Ce repère n'existe pas.",
    notFoundBody:
      "La page que vous cherchez a disparu, ou n'a jamais existé. Vérifiez l'adresse, ou repartez d'un point connu.",
    errorLabel: "Erreur",
    errorTitle: "Quelque chose s'est mal passé.",
    errorBody:
      "Cette page n'a pas pu s'afficher correctement. Vous pouvez réessayer, ou revenir à l'accueil.",
    retry: "Réessayer",
    forbiddenMetaTitle: "Accès refusé",
    forbiddenCode: "403",
    forbiddenTitle: "Accès refusé.",
    forbiddenBody:
      "Cette page est réservée aux administrateurs. Si vous pensez que c'est une erreur, contactez un administrateur de votre organisation.",
    goToDashboard: "Aller à mon tableau de bord",
  },
};

// Not `typeof fr` on an `as const` object: that would pin Dictionary to fr's
// exact literal strings, and en.ts's own strings would fail to "satisfy" a
// type they were never meant to match value-for-value. Plain `typeof fr`
// widens every leaf to `string`, so only the *shape* is enforced.
export type Dictionary = typeof fr;
