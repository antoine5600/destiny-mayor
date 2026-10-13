// ===== API : Initialiser une nouvelle partie ★ =====
import { NextRequest, NextResponse } from 'next/server'
import { createInitialStats, CITIES } from '@/lib/game-engine/data'
import { startMandate } from '@/lib/game-engine/game-loop'
import type { Origin, Mayor } from '@/types/game'

const ORIGINS: Origin[] = ['rural', 'urbain', 'academique', 'entrepreneur']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, origin } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom du maire est requis.' },
        { status: 400 }
      )
    }
    if (!ORIGINS.includes(origin)) {
      return NextResponse.json(
        { error: `Origine invalide. Choisissez parmi : ${ORIGINS.join(', ')}` },
        { status: 400 }
      )
    }

    const currentYear = 2026
    const mayor: Mayor = {
      name: name.trim(),
      origin,
      birthYear: currentYear,
      stats: createInitialStats(origin),
      currentCityId: null,
      career: [],
      year: currentYear,
      isRetired: false,
    }

    // Première ville disponible selon l'origine → démarre directement le mandat
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
  const origins = ORIGINS.map(o => ({
    id: o,
    label: getOriginLabel(o),
    description: getOriginDescription(o),
  }))

  return NextResponse.json({
    success: true,
    data: { origins, cities: CITIES.map(c => ({ id: c.id, name: c.name, size: c.size, difficulty: c.difficulty })) },
  })
}

function getOriginLabel(origin: Origin): string {
  const labels: Record<Origin, string> = {
    rural: 'Rural 🏡',
    urbain: 'Urbain 🏙️',
    academique: 'Académique 🎓',
    entrepreneur: 'Entrepreneur 💼',
  }
  return labels[origin]
}

function getOriginDescription(origin: Origin): string {
  const descs: Record<Origin, string> = {
    rural: 'Vous avez grandi à la campagne. Proche des habitants, mais peu de budget.',
    urbain: 'Vous venez de la ville. Bon réseau, bonne gestion budgétaire.',
    academique: 'Vous sortez des grandes écoles. Très compétent en éducation.',
    entrepreneur: 'Vous avez monté votre entreprise. Le budget n\'a pas de secrets pour vous.',
  }
  return descs[origin]
}