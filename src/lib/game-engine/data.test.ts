// ===== Tests du moteur de jeu « Destiny Mayor » ★ =====
import { describe, it, expect } from 'vitest'
import {
  createInitialStats,
  applyEffects,
  applyCityModifiers,
  computeScore,
  canAccessCity,
  applyYearlyDecay,
  BACKGROUND_QUESTIONS,
  getBackgroundStats,
  CITIES,
  EVENTS,
} from '@/lib/game-engine/data'
import type { Stats, Mayor, Background } from '@/types/game'

describe('★ Background — questions de création', () => {
  it('BACKGROUND_QUESTIONS contient exactement 3 questions', () => {
    expect(BACKGROUND_QUESTIONS.length).toBe(3)
  })

  it('chaque question a 4 choix avec des effets', () => {
    for (const q of BACKGROUND_QUESTIONS) {
      expect(q.choices.length).toBe(4)
      for (const c of q.choices) {
        expect(typeof c.effects).toBe('object')
        expect(Object.keys(c.effects).length).toBeGreaterThan(0)
      }
    }
  })

  it('getBackgroundStats calcule les stats depuis les 3 réponses', () => {
    const bg: Background = {
      origins: 'famille-ouvriere',
      studies: 'lycee-general',
      work: 'ouvrier-artisan',
    }
    const stats = getBackgroundStats(bg)
    expect(stats.budget).toBeGreaterThanOrEqual(0)
    expect(stats.opinion).toBeGreaterThanOrEqual(0)
    expect(stats.education).toBeGreaterThanOrEqual(0)
    const total = Object.values(stats).reduce((a, b) => a + b, 0)
    expect(total).toBeGreaterThan(150) // Au moins la base 30×5=150
  })
})

describe('★ createInitialStats (via background)', () => {
  it('crée des stats valides pour un background complet', () => {
    const bg: Background = {
      origins: 'famille-commercants',
      studies: 'grande-ecole',
      work: 'militant-associatif',
    }
    const stats = createInitialStats(bg)
    const values = Object.values(stats)
    expect(values.length).toBe(5)
    expect(values.every(v => v >= 0 && v <= 100)).toBe(true)
  })
})

describe('★ Stats — applyEffects', () => {
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
  const DEFAULT_BG: Background = {
    origins: 'famille-ouvriere',
    studies: 'lycee-general',
    work: 'ouvrier-artisan',
  }

  it('computeScore retourne un grade valide', () => {
    const mayor: Mayor = {
      name: 'Test',
      background: DEFAULT_BG,
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
      background: DEFAULT_BG,
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

  it('chaque ville est trouvable par son id dans CITIES', () => {
    for (const city of CITIES) {
      const found = CITIES.find(c => c.id === city.id)
      expect(found).toBeDefined()
      expect(found!.name).toBe(city.name)
      expect(found!.size).toBe(city.size)
    }
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