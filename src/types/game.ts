// ===== Types du jeu « Destiny Mayor » ★ =====

/** Les 5 stats principales du maire */
export type StatName = 'budget' | 'opinion' | 'infrastructure' | 'education' | 'securite'

/** Ensemble des stats (0-100) */
export type Stats = Record<StatName, number>

/** Taille de ville */
export type CitySize = 'petit-village' | 'ville-moyenne' | 'grande-ville' | 'metropole'

/** Difficulté d'une ville */
export type CityDifficulty = 'facile' | 'moyen' | 'difficile' | 'extreme'

/** Réponse à une question de background */
export type BackgroundAnswer = string

/** Les 3 réponses qui définissent le passé du maire */
export interface Background {
  origins: BackgroundAnswer
  studies: BackgroundAnswer
  work: BackgroundAnswer
}

/** Une question posée lors de la création du personnage */
export interface BackgroundQuestion {
  id: string
  title: string
  icon: string
  choices: BackgroundChoice[]
}

export interface BackgroundChoice {
  id: string
  label: string
  icon: string
  effects: Partial<Stats>
}

/** Événement aléatoire */
export interface GameEvent {
  id: string
  title: string
  description: string
  choices: EventChoice[]
  condition?: {
    stat: StatName
    min?: number
    max?: number
  }
}

export interface EventChoice {
  label: string
  effects: Partial<Stats>
  description: string
}

/** Ville */
export interface City {
  id: string
  name: string
  size: CitySize
  difficulty: CityDifficulty
  population: number
  description: string
  bonus?: Partial<Stats>
  malus?: Partial<Stats>
}

/** État du personnage */
export interface Mayor {
  name: string
  background: Background
  birthYear: number
  stats: Stats
  currentCityId: string | null
  career: CareerEntry[]
  year: number
  isRetired: boolean
}

/** Entrée de carrière */
export interface CareerEntry {
  cityId: string
  startYear: number
  endYear: number
  eventsHappened: string[]
  finalStats: Stats
  satisfaction: number
}

/** Résultat de fin de carrière */
export interface CareerResult {
  mayor: Mayor
  totalYears: number
  citiesGoverned: number
  finalScore: number
  grade: Grade
  destituted?: boolean
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E'

/** Contexte du jeu pour l'UI */
export interface GameContext {
  mayor: Mayor | null
  currentCity: City | null
  currentEvent: GameEvent | null
  phase: 'creation' | 'carriere' | 'evenement' | 'fin-mandat' | 'retraite' | 'destitution'
  yearInMandate: number
  mandateLength: number
}