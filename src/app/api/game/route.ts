// ===== API : Initialiser une nouvelle partie ★ =====
import { NextRequest, NextResponse } from 'next/server'
import { createInitialStats, CITIES, BACKGROUND_QUESTIONS } from '@/lib/game-engine/data'
import { startMandate } from '@/lib/game-engine/game-loop'
import type { Background, Mayor } from '@/types/game'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, background } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom du maire est requis.' },
        { status: 400 }
      )
    }
    if (!background || !background.origins || !background.studies || !background.work) {
      return NextResponse.json(
        { error: 'Les 3 questions de profil sont requises.' },
        { status: 400 }
      )
    }

    const currentYear = 2026
    const mayor: Mayor = {
      name: name.trim(),
      background,
      birthYear: currentYear,
      stats: createInitialStats(background),
      currentCityId: null,
      career: [],
      year: currentYear,
      isRetired: false,
    }

    // Première ville → démarre directement le mandat
    const firstCity = CITIES[0]
    const context = startMandate(mayor, firstCity)

    return NextResponse.json({ success: true, data: context })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation de la partie.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      questions: BACKGROUND_QUESTIONS,
      cities: CITIES.map(c => ({ id: c.id, name: c.name, size: c.size, difficulty: c.difficulty })),
    },
  })
}