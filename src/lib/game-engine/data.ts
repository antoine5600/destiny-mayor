// ===== Données du jeu « Destiny Mayor » ★ =====
import type { City, GameEvent, Origin, Stats, Grade, CareerResult, Mayor, CitySize } from '@/types/game'

/** Stats de départ selon l'origine */
export const ORIGIN_BONUSES: Record<Origin, Stats> = {
  rural:      { budget: 30, opinion: 50, infrastructure: 30, education: 25, securite: 40 },
  urbain:     { budget: 50, opinion: 40, infrastructure: 45, education: 40, securite: 30 },
  academique: { budget: 25, opinion: 25, infrastructure: 30, education: 60, securite: 35 },
  entrepreneur: { budget: 55, opinion: 30, infrastructure: 40, education: 30, securite: 35 },
}

/** Villes disponibles */
export const CITIES: City[] = [
  {
    id: 'saint-pierre',
    name: 'Saint-Pierre',
    size: 'petit-village',
    difficulty: 'facile',
    population: 2_000,
    description: 'Un petit village paisible avec un budget serré mais une communauté soudée.',
    bonus: { opinion: 10 },
    malus: { budget: -10 },
  },
  {
    id: 'montclair',
    name: 'Montclair',
    size: 'petit-village',
    difficulty: 'facile',
    population: 4_500,
    description: 'Village en croissance, quelques commerces et une école primaire.',
    bonus: { education: 5, opinion: 5 },
  },
  {
    id: 'val-dore',
    name: 'Val-d\'Oré',
    size: 'ville-moyenne',
    difficulty: 'moyen',
    population: 35_000,
    description: 'Une ville moyenne avec une zone industrielle et un centre historique.',
    bonus: { budget: 10 },
    malus: { securite: -5 },
  },
  {
    id: 'port-azure',
    name: 'Port-Azure',
    size: 'ville-moyenne',
    difficulty: 'moyen',
    population: 50_000,
    description: 'Ville côtière touristique, forte pression immobilière.',
    malus: { opinion: -5, infrastructure: -5 },
  },
  {
    id: 'nova-cité',
    name: 'Nova-Cité',
    size: 'grande-ville',
    difficulty: 'difficile',
    population: 250_000,
    description: 'Grande ville moderne, défis de transport et de logement.',
    bonus: { budget: 20 },
    malus: { opinion: -10, securite: -10 },
  },
  {
    id: 'fer-de-lance',
    name: 'Fer-de-Lance',
    size: 'grande-ville',
    difficulty: 'difficile',
    population: 180_000,
    description: 'Ancienne ville industrielle en reconversion, forte identité ouvrière.',
    bonus: { infrastructure: 15 },
    malus: { budget: -15 },
  },
  {
    id: 'capitolia',
    name: 'Capitolia',
    size: 'metropole',
    difficulty: 'extreme',
    population: 1_200_000,
    description: 'La capitale tentaculaire, tout est possible mais tout coûte cher.',
    bonus: { budget: 30 },
    malus: { opinion: -15, securite: -15, infrastructure: -10 },
  },
  // ★ Nouvelles villes
  {
    id: 'belle-rive',
    name: 'Belle-Rive',
    size: 'ville-moyenne',
    difficulty: 'facile',
    population: 28_000,
    description: 'Une ville au bord du fleuve, fière de son patrimoine fluvial mais menacée par la montée des eaux. Les vieux quartiers ont du cachet mais les infrastructures vieillissent.',
    bonus: { opinion: 5 },
    malus: { infrastructure: -5 },
  },
  {
    id: 'hauterive',
    name: 'Clairval',
    size: 'petit-village',
    difficulty: 'facile',
    population: 1_800,
    description: 'Perché sur une colline, ce village offre une vue imprenable sur la vallée. Les habitants s\'accrochent à leurs traditions mais la jeunesse s\'en va.',
    bonus: { opinion: 15, education: 5 },
    malus: { budget: -15 },
  },
  {
    id: 'pierres-blanches',
    name: 'Pierres-Blanches',
    size: 'ville-moyenne',
    difficulty: 'moyen',
    population: 42_000,
    description: 'Cité médiévale aux ruelles pavées, classée zone historique. Le tourisme fait vivre la ville mais les règles de protection des bâtiments compliquent tous les travaux.',
    bonus: { opinion: 10, infrastructure: 5 },
    malus: { budget: -10, education: -5 },
  },
  {
    id: 'saint-eloi',
    name: 'Saint-Éloi',
    size: 'grande-ville',
    difficulty: 'difficile',
    population: 200_000,
    description: 'Berceau de l\'industrie textile du pays, Saint-Éloi panse encore les plaies de la désindustrialisation. Les friches industrielles sont partout, mais l\'esprit ouvrier reste vivace.',
    malus: { budget: -10, opinion: -5, education: -10 },
  },
  {
    id: 'havre-lumiere',
    name: 'Havre-Lumière',
    size: 'grande-ville',
    difficulty: 'difficile',
    population: 190_000,
    description: 'Ville portuaire cosmopolite, carrefour des cultures et du commerce. L\'air du large porte les promesses d\'un avenir radieux, mais les inégalités sociales y sont criantes.',
    bonus: { budget: 15, opinion: 5 },
    malus: { securite: -10, education: -5 },
  },
]

/** Événements aléatoires */
export const EVENTS: GameEvent[] = [
  {
    id: 'inondation',
    title: 'Inondations',
    description: 'Des pluies torrentielles menacent les quartiers bas de la ville. Les digues tiennent à peine.',
    choices: [
      { label: 'Débloquer un budget d\'urgence', effects: { budget: -20, opinion: 10, infrastructure: 5 }, description: 'Les travaux sauvent les quartiers. La population apprécie.' },
      { label: 'Prioriser les évacuations', effects: { budget: -5, opinion: 15, securite: 5 }, description: 'Moins de dégâts humains, mais les dégâts matériels restent.' },
      { label: 'Minimiser et croiser les doigts', effects: { budget: 5, opinion: -20, infrastructure: -10 }, description: 'Économie immédiate mais la population vous en veut.' },
    ],
  },
  {
    id: 'nouvelle-ecole',
    title: 'Nouvelle école',
    description: 'Le nombre d\'élèves a explosé, une nouvelle école est nécessaire de toute urgence.',
    choices: [
      { label: 'Construire une école neuve', effects: { budget: -25, education: 20, opinion: 10 }, description: 'Investissement lourd mais la qualité d\'éducation grimpe.' },
      { label: 'Agrandir l\'école existante', effects: { budget: -10, education: 10, opinion: 5 }, description: 'Solution économique mais moins efficace.' },
      { label: 'Réquisitionner un bâtiment municipal', effects: { budget: -5, education: 5, opinion: -10 }, description: 'Solution de court terme impopulaire.' },
    ],
  },
  {
    id: 'greve',
    title: 'Grève des éboueurs',
    description: 'Les éboueurs réclament de meilleures conditions. Les poubelles s\'accumulent dans les rues.',
    choices: [
      { label: 'Accorder les augmentations', effects: { budget: -15, opinion: 10, securite: 5 }, description: 'Les éboueurs reprennent le travail, la ville respire.' },
      { label: 'Négocier un compromis', effects: { budget: -5, opinion: 5, securite: 0 }, description: 'Solution moyenne, personne n\'est pleinement satisfait.' },
      { label: 'Tenir bon et réquisitionner', effects: { budget: 5, opinion: -15, infrastructure: -5 }, description: 'Économies mais la ville se dégrade.' },
    ],
  },
  {
    id: 'festival',
    title: 'Festival culturel',
    description: 'Un organisateur propose un grand festival dans votre ville. Gros potentiel touristique mais risqué.',
    choices: [
      { label: 'Financer généreusement', effects: { budget: -10, opinion: 20, infrastructure: 5 }, description: 'Le festival est un succès, la ville rayonne.' },
      { label: 'Accorder un petit budget', effects: { budget: -3, opinion: 8, infrastructure: 0 }, description: 'Petit événement sympa mais sans grand retentissement.' },
      { label: 'Refuser, trop risqué', effects: { budget: 5, opinion: -5, securite: 5 }, description: 'Sécurité budgétaire, mais la ville reste terne.' },
    ],
  },
  {
    id: 'casse',
    title: 'Vague de cambriolages',
    description: 'Une série de cambriolages inquiète les habitants. La sécurité est remise en question.',
    choices: [
      { label: 'Augmenter les effectifs de police', effects: { budget: -20, securite: 20, opinion: 10 }, description: 'La délinquance baisse nettement.' },
      { label: 'Lancer un programme de voisinage', effects: { budget: -5, securite: 10, opinion: 5, education: 5 }, description: 'Prévention citoyenne, résultats modestes mais durables.' },
      { label: 'Communiquer sans agir', effects: { budget: 5, opinion: -20, securite: -5 }, description: 'Les discours ne suffisent pas.' },
    ],
  },
  {
    id: 'subvention',
    title: 'Subvention nationale',
    description: 'L\'État propose une subvention pour un projet d\'envergure. À vous de choisir le domaine.',
    choices: [
      { label: 'Moderniser les routes et transports', effects: { budget: 15, infrastructure: 20, opinion: 5 }, description: 'Les infrastructures s\'améliorent.' },
      { label: 'Investir dans les écoles', effects: { budget: 15, education: 20, opinion: 10 }, description: 'L\'éducation reçoit un boost.' },
      { label: 'Créer un centre culturel', effects: { budget: 15, opinion: 15, education: 5 }, description: 'La culture locale s\'épanouit.' },
    ],
  },
  // ★ Nouveaux événements narratifs
  {
    id: 'scandale-urbanisme',
    title: 'Scandale d\'urbanisme',
    description: 'Un promoteur immobilier proche de la mairie a obtenu un permis de construire litigieux. L\'opposition crie au favoritisme. Les articles commencent à pleuvoir dans la presse locale.',
    choices: [
      { label: 'Annuler le permis et lancer une enquête', effects: { budget: -10, opinion: 20, securite: 5 }, description: 'Vous montrez votre intégrité. L\'enquête calme le jeu, même si vous perdez un allié influent.' },
      { label: 'Défendre le projet et ses emplois', effects: { budget: 10, opinion: -15, infrastructure: 10 }, description: 'Le projet crée des emplois mais votre réputation en prend un coup. Les détracteurs vous accusent de complicité.' },
      { label: 'Rencontrer le promoteur en secret', effects: { budget: 15, opinion: -10, securite: -5 }, description: 'Un arrangement est trouvé dans l\'ombre. Personne ne saura jamais ce qui s\'est dit, mais vous vous sentez sale.' },
    ],
  },
  {
    id: 'epidemie-grippe',
    title: 'Épidémie saisonnière',
    description: 'Une grippe particulièrement virulente frappe la ville. Les écoles et les maisons de retraite sont touchées. Les hôpitaux saturés appellent à l\'aide. Chaque heure compte.',
    choices: [
      { label: 'Lancer une campagne de vaccination massive', effects: { budget: -20, opinion: 15, education: 5, securite: 10 }, description: 'Les files d\'attente s\'allongent mais les vies sont sauvées. Les médecins vous saluent.' },
      { label: 'Confiner temporairement les écoles', effects: { budget: -5, opinion: 5, education: -10, securite: 5 }, description: 'Mesure impopulaire chez les parents mais la propagation ralentit.' },
      { label: 'Minimiser la gravité et communiquer', effects: { budget: 5, opinion: -20, securite: -5 }, description: 'Vous rassurez la population mais les cas graves s\'accumulent. La presse vous étrille.' },
    ],
  },
  {
    id: 'marche-nocturne',
    title: 'Le marché nocturne',
    description: 'Des habitants proposent d\'organiser un marché de nuit hebdomadaire dans le centre-ville. Les commerçants sont divisés : les uns y voient une aubaine, les autres craignent le bruit et l\'insécurité.',
    choices: [
      { label: 'Autoriser et financer le marché', effects: { budget: -5, opinion: 15, securite: -5 }, description: 'Le marché est un succès populaire. Les ruelles s\'animent, mais quelques plaintes pour tapage arrivent.' },
      { label: 'Proposer une version encadrée', effects: { budget: -3, opinion: 8, securite: 5 }, description: 'Compromis raisonnable : le marché a lieu mais avec des règles strictes. Tout le monde grogne un peu.' },
      { label: 'Refuser, risque trop élevé', effects: { budget: 5, opinion: -10, securite: 5 }, description: 'Vous misez sur la tranquillité. Les commerçants innovants vous en veulent.' },
    ],
  },
  {
    id: 'fermeture-usine',
    title: 'Fermeture annoncée',
    description: 'L\'usine historique du bassin d\'emploi annonce sa fermeture dans six mois. Cinq cents employés vont perdre leur travail. La ville, déjà fragile, risque le coup de grâce.',
    choices: [
      { label: 'Négocier un plan social avec reclassement', effects: { budget: -20, opinion: 15, education: 10, securite: 5 }, description: 'Vous obtenez des formations et des reclassements. Certains retrouveront un emploi, mais tous ne seront pas sauvés.' },
      { label: 'Proposer des exonérations fiscales', effects: { budget: -15, opinion: 5, infrastructure: 10 }, description: 'Vous tentez de faire revenir l\'usine sur sa décision. La direction accepte de reporter, pas d\'annuler.' },
      { label: 'Laisser faire le marché', effects: { budget: 10, opinion: -25, securite: -10 }, description: 'Pas un centime public. La ville se vide, les commerces ferment. Votre popularité s\'effondre.' },
    ],
  },
  {
    id: 'tempete-verglas',
    title: 'Tempête de verglas',
    description: 'Une tempête de glace historique s\'abat sur la région. Les lignes électriques cèdent, les routes sont impraticables, les personnes âgées sont coincées chez elles sans chauffage.',
    choices: [
      { label: 'Ouvrir des centres d\'urgence chauffés', effects: { budget: -15, opinion: 20, infrastructure: 5 }, description: 'Les gymnases se transforment en refuges. La solidarité s\'organise, les habitants vous remercient.' },
      { label: 'Déployer la voirie en priorité', effects: { budget: -10, opinion: 10, infrastructure: 15 }, description: 'Les routes sont dégagées en 48h. L\'approvisionnement reprend mais certains ont souffert du froid.' },
      { label: 'Attendre que ça passe', effects: { budget: 5, opinion: -15, infrastructure: -10 }, description: 'Vous économisez le budget. Mais trois jours sans électricité, c\'est long. La ville se souvient.' },
    ],
  },
  {
    id: 'conflit-associations',
    title: 'Guerre des associations',
    description: 'Deux associations locales rivales se déchirent pour l\'attribution de la salle des fêtes municipale. L\'une organise la fête du terroir, l\'autre un concert solidaire. Les passions s\'enflamment en conseil municipal.',
    choices: [
      { label: 'Atteindre une médiation équitable', effects: { budget: -5, opinion: 15, education: 5 }, description: 'Vous jouez les arbitres. Les deux associations finissent par coorganiser un événement commun, qui cartonne.' },
      { label: 'Trancher en faveur du concert', effects: { budget: 0, opinion: 5, education: 10 }, description: 'La jeunesse vous applaudit mais les traditionalistes bougonnent. Une scission s\'amorce.' },
      { label: 'Ne pas s\'en mêler', effects: { budget: 5, opinion: -10, securite: -5 }, description: 'Les deux camps vous reprochent votre passivité. La salle reste fermée et tout le monde est perdant.' },
    ],
  },
  {
    id: 'nouveau-logement',
    title: 'Crise du logement',
    description: 'Les prix de l\'immobilier explosent. Les jeunes familles quittent la ville, faute de pouvoir se loger. Un promoteur propose un gigantesque programme immobilier sur une friche.',
    choices: [
      { label: 'Approuver le programme de logements sociaux', effects: { budget: -20, opinion: 15, infrastructure: 10, education: 5 }, description: 'Les HLM sortent de terre. Les nouveaux arrivants repeuplent l\'école, mais les anciens râlent sur le changement.' },
      { label: 'Négocier un mix social et privé', effects: { budget: -5, opinion: 10, infrastructure: 5 }, description: 'Compromis intelligent : moitié logements sociaux, moitié accession. Personne n\'est ravi, mais personne ne manifeste.' },
      { label: 'Ne pas toucher au PLU', effects: { budget: 10, opinion: -15, infrastructure: -5 }, description: 'Vous protégez le cadre de vie. Mais la ville se gentrifie et les jeunes s\'en vont.' },
    ],
  },
  {
    id: 'pole-energie',
    title: 'Projet de parc éolien',
    description: 'Un énergéticien propose d\'installer six éoliennes sur la colline voisine. Énergie verte et recettes fiscales contre nuisance visuelle et patrimoine paysager. Les débats enflamment le café du village.',
    choices: [
      { label: 'Soutenir le projet écologique', effects: { budget: 15, opinion: 5, infrastructure: 10 }, description: 'Les éoliennes tournent. Les comptes de la ville respirent, mais les puristes du paysage ne vous le pardonneront pas.' },
      { label: 'Organiser un référendum local', effects: { budget: -5, opinion: 15, securite: 5 }, description: 'Vous laissez les citoyens décider. La démocratie locale sort renforcée, mais le projet prend du retard.' },
      { label: 'Bloquer le projet', effects: { budget: 5, opinion: -10, infrastructure: -5 }, description: 'Le paysage est préservé. Mais votre refus de l\'innovation vous colle à la peau.' },
    ],
  },
  {
    id: 'tensions-banlieue',
    title: 'Tensions en périphérie',
    description: 'Une nuit de violences urbaines éclate dans un quartier sensible. Des voitures brûlent, des commerces sont vandalisés. La situation est tendue, et les habitants du centre-ville ont peur.',
    choices: [
      { label: 'Dialoguer avec les jeunes du quartier', effects: { budget: -10, opinion: 10, education: 15, securite: 5 }, description: 'Vous tendez la main. Les échanges sont durs mais sincères. Un vrai travail de fond commence.' },
      { label: 'Renforcer la présence policière', effects: { budget: -15, opinion: 5, securite: 20 }, description: 'Les CRS patrouillent, le calme revient. Mais la défiance entre la police et la jeunesse s\'aggrave.' },
      { label: 'Condamner fermement les violences', effects: { budget: 5, opinion: -15, education: -5, securite: -10 }, description: 'Vos déclarations martiales plaisent au centre-ville, mais vous perdez tout crédit dans les quartiers.' },
    ],
  },
  {
    id: 'annee-culturelle',
    title: 'Année culturelle',
    description: 'Un mécène local, ancien enfant du pays devenu célèbre, propose de financer une saison culturelle d\'exception. Concerts, expositions et spectacles pendant six mois. Un souffle inespéré.',
    choices: [
      { label: 'Saisir l\'opportunité avec enthousiasme', effects: { budget: 10, opinion: 20, education: 15 }, description: 'La saison est un triomphe. La ville rayonne dans tout le pays. On parle de vous comme d\'un visionnaire.' },
      { label: 'Accepter avec un programme modeste', effects: { budget: 5, opinion: 8, education: 5 }, description: 'Quelques beaux événements animent l\'automne. Sympa mais pas inoubliable.' },
      { label: 'Refuser, priorité aux services publics', effects: { budget: 10, opinion: -10, securite: 5 }, description: 'La culture attendra. Votre prudence est respectée mais le mécène offensé ne reviendra pas.' },
    ],
  },
  {
    id: 'secheresse',
    title: 'Sécheresse historique',
    description: 'Trois mois sans une goutte de pluie. Les nappes phréatiques sont au plus bas. Les agriculteurs sont désespérés, les fontaines sont à sec, et des restrictions d\'eau sont inévitables.',
    choices: [
      { label: 'Instaurer des restrictions strictes et équitables', effects: { budget: -5, opinion: 10, infrastructure: 5 }, description: 'Les restrictions passent mieux grâce à votre communication transparente. L\'eau est rationnée mais pas injustement.' },
      { label: 'Investir dans des citernes et camions-citernes', effects: { budget: -20, opinion: 5, infrastructure: 15 }, description: 'L\'eau potable est acheminée. Solution coûteuse mais efficace. Les agriculteurs vous doivent une fière chandelle.' },
      { label: 'Laisser faire et espérer la pluie', effects: { budget: 10, opinion: -20, infrastructure: -10 }, description: 'Un agriculteur perd son troupeau. Les habitants vous pardonnent mal votre inaction.' },
    ],
  },
]

/** Calcule le score final */
export function computeScore(mayor: Mayor): CareerResult {
  const totalYears = mayor.year - mayor.birthYear
  const citiesGoverned = mayor.career.length
  const avgStats = averageStats(mayor.stats)
  const satisfaction = mayor.career.reduce((sum, e) => sum + e.satisfaction, 0) / Math.max(mayor.career.length, 1)

  // Formule : moyenne stats × 2 + années × 1.5 + satisfaction × 10 + bonus villes
  const cityBonus = citiesGoverned * 20
  const finalScore = Math.round(avgStats * 2 + totalYears * 1.5 + satisfaction * 10 + cityBonus)

  return { mayor, totalYears, citiesGoverned, finalScore, grade: getGrade(finalScore) }
}

function averageStats(stats: Stats): number {
  const values: number[] = Object.values(stats)
  return values.reduce((a, b) => a + b, 0) / values.length
}

function getGrade(score: number): Grade {
  if (score >= 500) return 'S'
  if (score >= 400) return 'A'
  if (score >= 300) return 'B'
  if (score >= 200) return 'C'
  if (score >= 100) return 'D'
  return 'E'
}

/** Applique des effets sur les stats (clamp 0-100) */
export function applyEffects(stats: Stats, effects: Partial<Stats>): Stats {
  const newStats = { ...stats }
  for (const [key, value] of Object.entries(effects)) {
    const k = key as keyof Stats
    newStats[k] = Math.max(0, Math.min(100, newStats[k] + (value ?? 0)))
  }
  return newStats
}

/** Applique bonus/malus de la ville */
export function applyCityModifiers(stats: Stats, city: City): Stats {
  let result = { ...stats }
  if (city.bonus) result = applyEffects(result, city.bonus)
  if (city.malus) result = applyEffects(result, city.malus)
  return result
}

/** Calcule la difficulté d'accès à une ville */
export function getCityRequirement(city: City): { stat: keyof Stats; min: number } {
  switch (city.size) {
    case 'petit-village':  return { stat: 'opinion', min: 10 }
    case 'ville-moyenne':  return { stat: 'opinion', min: 30 }
    case 'grande-ville':   return { stat: 'opinion', min: 50 }
    case 'metropole':      return { stat: 'opinion', min: 70 }
  }
}

/** Vérifie si le maire peut accéder à une ville */
export function canAccessCity(stats: Stats, city: City): boolean {
  const req = getCityRequirement(city)
  return stats[req.stat] >= req.min
}

/** Calcule les stats de départ */
export function createInitialStats(origin: Origin): Stats {
  return { ...ORIGIN_BONUSES[origin] }
}

/** Longueur d'un mandat en années */
export const MANDATE_LENGTH: Record<CitySize, number> = {
  'petit-village': 6,
  'ville-moyenne': 6,
  'grande-ville': 5,
  'metropole': 5,
}

/** Évolution naturelle des stats par an */
export const YEARLY_DECAY: Partial<Stats> = {
  budget: -2,
  opinion: -1,
  infrastructure: -1,
  education: 0,
  securite: -1,
}

export function applyYearlyDecay(stats: Stats): Stats {
  return applyEffects(stats, YEARLY_DECAY)
}