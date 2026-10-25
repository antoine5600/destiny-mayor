// ===== Tests de la boucle de jeu ★ =====
import { describe, it, expect } from 'vitest'
import {
  startMandate,
  advanceYear,
  resolveEventChoice,
  endMandate,
  getAccessibleCities,
  retire,
} from '@/lib/game-engine/game-loop'
import { CITIES, EVENTS, createInitialStats } from '@/lib/game-engine/data'
import type { Mayor, GameContext } from '@/types/game'

function createTestMayor(overrides: Partial<Mayor> = {}): Mayor {
  return {
    name: 'Test',
    background: {
      origins: 'famille-ouvriere',
      studies: 'lycee-general',
      work: 'ouvrier-artisan',
    },
    birthYear: 2026,
    stats: { budget: 50, opinion: 50, infrastructure: 50, education: 50, securite: 50 },
    currentCityId: null,
    career: [],
    year: 2026,
    isRetired: false,
    ...overrides,
  }
}

describe('★ startMandate', () => {
  it('démarre un mandat avec les stats modifiées par la ville', () => {
    const mayor = createTestMayor()
    const city = CITIES[0] // Saint-Pierre (bonus opinion +10, malus budget -10)
    const ctx = startMandate(mayor, city)
    expect(ctx.phase).toBe('carriere')
    expect(ctx.yearInMandate).toBe(0)
    expect(ctx.currentCity?.id).toBe('saint-pierre')
    expect(ctx.mayor!.stats.opinion).toBe(60) // 50 + 10
    expect(ctx.mayor!.stats.budget).toBe(40) // 50 - 10
  })

  it('définit la bonne durée de mandat selon la taille', () => {
    const mayor = createTestMayor()
    const smallCity = CITIES.find(c => c.size === 'petit-village')!
    const bigCity = CITIES.find(c => c.size === 'metropole')!
    expect(startMandate(mayor, smallCity).mandateLength).toBe(6)
    expect(startMandate(mayor, bigCity).mandateLength).toBe(5)
  })
})

describe('★ advanceYear', () => {
  it('applique la décroissance annuelle', () => {
    const mayor = createTestMayor()
    const ctx = startMandate(mayor, CITIES[0])
    const result = advanceYear(ctx)
    expect(result.mayor!.year).toBe(2027)
    expect(result.yearInMandate).toBe(1)
    expect(result.mayor!.stats.budget).toBeLessThan(50)
  })

  it('passe en phase evenement quand un événement arrive', () => {
    // On avance plusieurs années pour avoir un événement
    const mayor = createTestMayor()
    let ctx = startMandate(mayor, CITIES[0])
    let hasSeenEvent = false
    for (let i = 0; i < 10; i++) {
      ctx = advanceYear(ctx)
      if (ctx.phase === 'evenement') {
        hasSeenEvent = true
        expect(ctx.currentEvent).not.toBeNull()
        break
      }
    }
    expect(hasSeenEvent).toBe(true)
  })

  it('passe en fin-mandat au bout de 6 ans', () => {
    const mayor = createTestMayor()
    let ctx = startMandate(mayor, CITIES[0])
    for (let i = 0; i < 6; i++) {
      ctx = advanceYear(ctx)
    }
    expect(ctx.phase).toBe('fin-mandat')
    expect(ctx.yearInMandate).toBe(6)
  })
})

describe('★ resolveEventChoice', () => {
  it('applique les effets du choix choisi', () => {
    const mayor = createTestMayor()
    const event = EVENTS[0] // Inondation
    const result = resolveEventChoice(mayor, event, 0) // Budget d'urgence
    expect(result.mayor!.stats.budget).toBe(30) // 50 - 20
    expect(result.mayor!.stats.opinion).toBe(60) // 50 + 10
  })

  it('retourne un message de résultat', () => {
    const mayor = createTestMayor()
    const event = EVENTS[0]
    const result = resolveEventChoice(mayor, event, 0)
    expect(result.eventResult.length).toBeGreaterThan(0)
  })

  it('signale un choix invalide avec eventResult approprié', () => {
    const mayor = createTestMayor()
    const event = EVENTS[0]
    const result = resolveEventChoice(mayor, event, 999) // Index inexistant
    expect(result.eventResult).toBe('Choix invalide.')
    expect(result.destituted).toBe(false)
    // Les stats ne doivent pas changer
    expect(result.mayor.stats).toEqual(mayor.stats)
  })

  it('détecte la destitution quand une stat tombe à 0', () => {
    const mayor = createTestMayor({ stats: { budget: 5, opinion: 50, infrastructure: 50, education: 50, securite: 50 } })
    const event = EVENTS[0] // Inondation, choix 0 : budget -20 → 5 - 20 = -15 → clamp à 0
    const result = resolveEventChoice(mayor, event, 0)
    expect(result.destituted).toBe(true)
    expect(result.mayor.stats.budget).toBe(0)
  })
})

describe('★ endMandate', () => {
  it('enregistre le mandat dans la carrière', () => {
    let ctx = startMandate(createTestMayor(), CITIES[0])
    ctx = advanceYear(ctx) // Simule 1 an
    const { context } = endMandate(ctx)
    expect(context.mayor!.career.length).toBe(1)
    expect(context.mayor!.career[0].cityId).toBe('saint-pierre')
  })
})

describe('★ getAccessibleCities', () => {
  it('retourne les villes accessibles selon le niveau d\'opinion', () => {
    const lowOpinion = createTestMayor({ stats: { budget: 50, opinion: 5, infrastructure: 50, education: 50, securite: 50 } })
    const highOpinion = createTestMayor({ stats: { budget: 50, opinion: 60, infrastructure: 50, education: 50, securite: 50 } })

    const lowCities = getAccessibleCities(lowOpinion)
    const highCities = getAccessibleCities(highOpinion)

    expect(lowCities.length).toBeLessThan(highCities.length)
    expect(lowCities.every(c => c.size === 'petit-village')).toBe(true)
  })
})

describe('★ retire', () => {
  it('calcule le score final avec le bon grade', () => {
    const mayor = createTestMayor({
      year: 2032,
      career: [{ cityId: 'saint-pierre', startYear: 2026, endYear: 2032, eventsHappened: [], finalStats: { budget: 50, opinion: 60, infrastructure: 50, education: 50, securite: 50 }, satisfaction: 52 }]
    })
    const result = retire(mayor)
    expect(result.totalYears).toBe(6) // 2032 - 2026
    expect(result.citiesGoverned).toBe(1)
    expect(['S', 'A', 'B', 'C', 'D', 'E']).toContain(result.grade)
  })
})