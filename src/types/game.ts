// ===== Types du jeu « Destiny Mayor » ★ =====

/** Les 5 stats principales du maire */
export type StatName = 'budget' | 'opinion' | 'infrastructure' | 'education' | 'securite'

/** Ensemble des stats (0-100) */
export type Stats = Record<StatName, number>

/** Taille de ville */
export type CitySize = 'petit-village' | 'ville-moyenne' | 'grande-ville' | 'metropole'

/** Difficulté d'une ville */
export type CityDifficulty = 'facile' | 'moyen' | 'difficile' | 'extreme'

/** Origine du personnage */
export type Origin = 'rural' | 'urbain' | 'academique' | 'entrepreneur'

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
  origin: Origin
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