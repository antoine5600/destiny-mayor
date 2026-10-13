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