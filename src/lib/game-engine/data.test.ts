// ===== Tests du moteur de jeu « Destiny Mayor » ★ =====
import { describe, it, expect } from 'vitest'
import {
  createInitialStats,
  applyEffects,
  applyCityModifiers,
  computeScore,
  canAccessCity,
  applyYearlyDecay,
  ORIGIN_BONUSES,
  CITIES,
  EVENTS,
} from '@/lib/game-engine/data'
import type { Stats, Mayor, Origin } from '@/types/game'

describe('★ Stats', () => {
  it('createInitialStats retourne les bonnes stats pour chaque origine', () => {
    const origins: Origin[] = ['rural', 'urbain', 'academique', 'entrepreneur']
    for (const origin of origins) {
      const stats = createInitialStats(origin)
      const expected = ORIGIN_BONUSES[origin]
      expect(stats).toEqual(expected)
    }
  })

  it('createInitialStats a des stats entre 0 et 100', () => {
    const stats = createInitialStats('rural')
    for (const value of Object.values(stats)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(100)
    }
  })

  it('applyEffects ajoute correctement les effets', () => {
    const stats: Stats = { budget: 50, opinion: 50, infrastructure: 50, education: 50, securite: 50 }
    const result = applyEffects(stats, { budget: 10, opinion: -5 })
    expect(result.budget).toBe(60)
    expect(result.opinion).toBe(45)
  })

  it('applyEffects clamp les valeurs entre 0 et 100', () => {
    const stats: Stats = { budget: 95, opinion: 5, infrastructure: 50, education: 50, securite: 50 }
    const result = applyEffects(stats, { budget: 20, opinion: -20 })
    expect(result.budget).toBe(100)
    expect(result.opinion).toBe(0)
  })

  it('applyEffects ne touche pas les stats non spécifiées', () => {
    const stats: Stats = { budget: 30, opinion: 40, infrastructure: 50, education: 60, securite: 70 }
    const result = applyEffects(stats, { budget: 10 })
    expect(result).toEqual({ budget: 40, opinion: 40, infrastructure: 50, education: 60, securite: 70 })
  })
})

describe('★ Villes', () => {
  it('CITIES contient au moins 12 villes de tailles différentes', () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(12)
    const sizes = new Set(CITIES.map(c => c.size))
    expect(sizes.has('petit-village')).toBe(true)
    expect(sizes.has('metropole')).toBe(true)
  })

  it('applyCityModifiers applique bonus et malus', () => {
    const city = CITIES[0] // Saint-Pierre (petit village, bonus opinion +10, malus budget -10)
    const stats: Stats = { budget: 50, opinion: 50, infrastructure: 50, education: 50, securite: 50 }
    const result = applyCityModifiers(stats, city)
    expect(result.opinion).toBe(60)
    expect(result.budget).toBe(40)
  })

  it('canAccessCity autorise ou refuse selon le niveau d\'opinion', () => {
    const metropole = CITIES.find(c => c.size === 'metropole')!
    const poorStats: Stats = { budget: 50, opinion: 20, infrastructure: 50, education: 50, securite: 50 }
    const goodStats: Stats = { budget: 50, opinion: 80, infrastructure: 50, education: 50, securite: 50 }
    expect(canAccessCity(poorStats, metropole)).toBe(false)
    expect(canAccessCity(goodStats, metropole)).toBe(true)
  })
})

describe('★ Événements', () => {
  it('EVENTS contient au moins 30 événements avec des choix', () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(30)
    for (const event of EVENTS) {
      expect(event.choices.length).toBeGreaterThanOrEqual(2)
      for (const choice of event.choices) {
        expect(typeof choice.effects).toBe('object')
      }
    }
  })
})

describe('★ Score final', () => {
  it('computeScore retourne un grade valide', () => {
    const mayor: Mayor = {
      name: 'Test',
      origin: 'rural',
      birthYear: 2025,
      stats: { budget: 70, opinion: 70, infrastructure: 70, education: 70, securite: 70 },
      currentCityId: 'saint-pierre',
      career: [{ cityId: 'saint-pierre', startYear: 2025, endYear: 2031, eventsHappened: [], finalStats: { budget: 50, opinion: 50, infrastructure: 50, education: 50, securite: 50 }, satisfaction: 80 }],
      year: 2035,
      isRetired: false,
    }
    const result = computeScore(mayor)
    expect(result.totalYears).toBe(10)
    expect(result.citiesGoverned).toBe(1)
    expect(result.finalScore).toBeGreaterThan(0)
    expect(['S', 'A', 'B', 'C', 'D', 'E']).toContain(result.grade)
  })

  it('computeScore donne un meilleur grade avec de meilleures stats', () => {
    const baseMayor: Mayor = {
      name: 'Test',
      origin: 'urbain',
      birthYear: 2025,
      stats: { budget: 50, opinion: 50, infrastructure: 50, education: 50, securite: 50 },
      currentCityId: null,
      career: [{ cityId: 'montclair', startYear: 2025, endYear: 2031, eventsHappened: [], finalStats: { budget: 50, opinion: 50, infrastructure: 50, education: 50, securite: 50 }, satisfaction: 50 }],
      year: 2031,
      isRetired: false,
    }
    const poor = computeScore({ ...baseMayor, stats: { budget: 20, opinion: 20, infrastructure: 20, education: 20, securite: 20 } })
    const good = computeScore({ ...baseMayor, stats: { budget: 90, opinion: 90, infrastructure: 90, education: 90, securite: 90 } })
    expect(good.finalScore).toBeGreaterThan(poor.finalScore)
  })
})

describe('★ Décroissance annuelle', () => {
  it('applyYearlyDecay diminue le budget, opinion, infra', () => {
    const stats: Stats = { budget: 80, opinion: 80, infrastructure: 70, education: 50, securite: 60 }
    const result = applyYearlyDecay(stats)
    expect(result.budget).toBe(79)   // -1
    expect(result.opinion).toBe(79)  // -1
    expect(result.infrastructure).toBe(69) // -1
    expect(result.education).toBe(50) // 0
    expect(result.securite).toBe(59) // -1
  })
})