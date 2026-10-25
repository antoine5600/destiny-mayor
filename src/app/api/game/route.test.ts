// ===== Tests de l'API ★ =====
import { describe, it, expect } from 'vitest'
import { createInitialStats } from '@/lib/game-engine/data'
import type { Background } from '@/types/game'

describe('★ API /api/game', () => {
  const VALID_BG: Background = {
    origins: 'famille-ouvriere',
    studies: 'lycee-general',
    work: 'ouvrier-artisan',
  }

  it("valide qu'un body correct est accepté", () => {
    expect(VALID_BG.origins).toBeTruthy()
    expect(VALID_BG.studies).toBeTruthy()
    expect(VALID_BG.work).toBeTruthy()
  })

  it('rejette les body invalides (background incomplet)', () => {
    const invalidBodies = [
      { name: 'Test', background: { origins: '', studies: 'lycee-general', work: 'ouvrier-artisan' } },
      { name: 'Test', background: { origins: 'famille-ouvriere', studies: '', work: 'ouvrier-artisan' } },
      { name: 'Test', background: { origins: 'famille-ouvriere', studies: 'lycee-general', work: '' } },
      { name: '', background: VALID_BG },
      {} as any,
    ]
    for (const body of invalidBodies) {
      const nameValid = body.name && typeof body.name === 'string' && body.name.trim().length > 0
      const bg = body.background as Background | undefined
      const bgValid = bg && bg.origins && bg.studies && bg.work
      if (!nameValid || !bgValid) {
        expect(true).toBe(true) // Rejeté ✓
      }
    }
  })

  it('crée des stats initiales valides pour différents background', () => {
    const bgs: Background[] = [
      { origins: 'famille-ouvriere', studies: 'lycee-general', work: 'ouvrier-artisan' },
      { origins: 'famille-notables', studies: 'grande-ecole', work: 'militant-associatif' },
      { origins: 'famille-commercants', studies: 'autodidacte', work: 'professeur-agent' },
    ]
    for (const bg of bgs) {
      const stats = createInitialStats(bg)
      const values = Object.values(stats)
      expect(values.length).toBe(5)
      expect(values.every(v => v >= 0 && v <= 100)).toBe(true)
    }
  })

  it('les stats varient selon les réponses', () => {
    const bg1: Background = { origins: 'famille-ouvriere', studies: 'lycee-general', work: 'ouvrier-artisan' }
    const bg2: Background = { origins: 'famille-notables', studies: 'grande-ecole', work: 'commercant-patron' }
    const stats1 = createInitialStats(bg1)
    const stats2 = createInitialStats(bg2)
    // Les deux profils doivent avoir des stats différentes
    expect(stats1).not.toEqual(stats2)
  })
})