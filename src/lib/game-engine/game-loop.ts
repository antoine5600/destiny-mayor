// ===== Boucle de jeu : mandats, années, événements ★ =====
import type { Mayor, City, GameEvent, GameContext, Stats, CareerEntry } from '@/types/game'
import {
  applyEffects,
  applyYearlyDecay,
  applyCityModifiers,
  CITIES,
  EVENTS,
  MANDATE_LENGTH,
  computeScore,
} from './data'

/** Démarre un mandat dans une ville */
export function startMandate(mayor: Mayor, city: City): GameContext {
  const initialStats = applyCityModifiers({ ...mayor.stats }, city)

  return {
    mayor: {
      ...mayor,
      stats: initialStats,
      currentCityId: city.id,
    },
    currentCity: city,
    currentEvent: null,
    phase: 'carriere',
    yearInMandate: 0,
    mandateLength: MANDATE_LENGTH[city.size],
  }
}

/** Tire un événement aléatoire */
export function drawRandomEvent(avoidIds: string[] = []): GameEvent | null {
  const available = EVENTS.filter(e => !avoidIds.includes(e.id))
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}

/** Applique un choix d'événement */
export function resolveEventChoice(
  mayor: Mayor,
  event: GameEvent,
  choiceIndex: number
): { mayor: Mayor; eventResult: string } {
  const choice = event.choices[choiceIndex]
  if (!choice) return { mayor, eventResult: 'Choix invalide.' }

  const newStats = applyEffects(mayor.stats, choice.effects)
  return {
    mayor: { ...mayor, stats: newStats },
    eventResult: choice.description,
  }
}

/** Avance d'un an dans le mandat */
export function advanceYear(context: GameContext): GameContext {
  const { mayor: m, currentCity, yearInMandate, mandateLength } = context
  if (!currentCity || !m) return context
  const mayor: Mayor = m

  const newYear = mayor.year + 1
  let newStats = applyYearlyDecay(mayor.stats)
  const nextYear = yearInMandate + 1
  const isEndOfMandate = nextYear >= mandateLength

  // Décider si un événement arrive cette année (60% de chance, sauf dernière année)
  const eventHappens = !isEndOfMandate && Math.random() < 0.6
  let newEvent: GameEvent | null = null
  if (eventHappens) {
    const usedIds = mayor.career.flatMap(e => e.eventsHappened)
    newEvent = drawRandomEvent(usedIds)
  }

  return {
    mayor: { ...mayor, stats: newStats, year: newYear },
    currentCity,
    currentEvent: newEvent,
    phase: newEvent ? 'evenement' : (isEndOfMandate ? 'fin-mandat' : 'carriere'),
    yearInMandate: nextYear,
    mandateLength,
  }
}

/** Termine le mandat en cours et enregistre la carrière */
export function endMandate(context: GameContext): { context: GameContext; satisfaction: number } {
  const { mayor: m, currentCity, yearInMandate } = context
  if (!currentCity || !m) return { context, satisfaction: 0 }
  const mayor: Mayor = m

  // Calcul de la satisfaction basée sur les stats finales
  const avgStat = Object.values(mayor.stats).reduce((a, b) => a + b, 0) / 5
  const satisfaction = Math.round(avgStat)

  const entry: CareerEntry = {
    cityId: currentCity.id,
    startYear: mayor.year - yearInMandate,
    endYear: mayor.year,
    eventsHappened: [],
    finalStats: { ...mayor.stats },
    satisfaction,
  }

  return {
    context: {
      ...context,
      mayor: {
        ...mayor,
        career: [...mayor.career, entry],
      },
      phase: 'fin-mandat',
    },
    satisfaction,
  }
}

/** Change de ville (réélection dans une nouvelle ville) */
export function moveToCity(context: GameContext, cityId: string): GameContext | null {
  const { mayor: m } = context
  if (!m) return null
  const mayor: Mayor = m
  const city = CITIES.find(c => c.id === cityId)
  if (!city) return null

  return startMandate(mayor, city)
}

/** Prend sa retraite et calcule le score final */
export function retire(mayor: Mayor) {
  return computeScore({
    name: mayor.name,
    origin: mayor.origin,
    birthYear: mayor.birthYear,
    stats: mayor.stats,
    currentCityId: mayor.currentCityId,
    career: mayor.career,
    year: mayor.year,
    isRetired: true,
  })
}

/** Récupère les villes accessibles */
export function getAccessibleCities(mayor: Mayor): City[] {
  return CITIES.filter(c => {
    // Niveau requis basé sur la taille
    const opinionRequired: Record<string, number> = {
      'petit-village': 0,
      'ville-moyenne': 15,
      'grande-ville': 30,
      'metropole': 50,
    }
    return mayor.stats.opinion >= (opinionRequired[c.size] ?? 0)
  })
}

/** Génère un résumé textuel pour l'UI */
export function getEventSummary(event: GameEvent): string {
  return `**${event.title}**\n${event.description}`
}