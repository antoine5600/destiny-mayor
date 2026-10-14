// ===== API : Actions de jeu ★ =====
import { NextRequest, NextResponse } from 'next/server'
import {
  startMandate,
  renewMandate,
  advanceYear,
  resolveEventChoice,
  endMandate,
  moveToCity,
  retire,
  getAccessibleCities,
} from '@/lib/game-engine/game-loop'
import { CITIES, createInitialStats } from '@/lib/game-engine/data'
import type { Mayor, City, GameContext } from '@/types/game'

type Action =
  | { type: 'start-mandate'; cityId: string }
  | { type: 'advance-year' }
  | { type: 'resolve-event'; choiceIndex: number }
  | { type: 'end-mandate' }
  | { type: 'move-city'; cityId: string }
  | { type: 'stay-in-city' }
  | { type: 'retire' }
  | { type: 'get-accessible-cities' }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { context, action } = body as { context: GameContext; action: Action }

    if (!context || !action) {
      return NextResponse.json({ error: 'Contexte et action requis.' }, { status: 400 })
    }

    switch (action.type) {
      case 'start-mandate': {
        const city = CITIES.find(c => c.id === action.cityId)
        if (!city) {
          return NextResponse.json({ error: 'Ville introuvable.' }, { status: 400 })
        }
        const newContext = startMandate(context.mayor as Mayor, city)
        return NextResponse.json({ success: true, data: newContext })
      }

      case 'advance-year': {
        const newContext = advanceYear(context)
        return NextResponse.json({ success: true, data: newContext })
      }

      case 'resolve-event': {
        if (!context.currentEvent) {
          return NextResponse.json({ error: 'Aucun événement en cours.' }, { status: 400 })
        }
        const result = resolveEventChoice(context.mayor as Mayor, context.currentEvent, action.choiceIndex)

        // Vérifier si c'était la dernière année
        if (context.yearInMandate >= context.mandateLength) {
          const ended = endMandate({ ...context, mayor: result.mayor, currentEvent: null, phase: 'carriere' })
          return NextResponse.json({ success: true, data: ended.context, eventResult: result.eventResult })
        }

        const newContext: GameContext = {
          ...context,
          mayor: result.mayor,
          currentEvent: null,
          phase: 'carriere',
        }
        return NextResponse.json({ success: true, data: newContext, eventResult: result.eventResult })
      }

      case 'end-mandate': {
        const { context: endedContext } = endMandate(context)
        return NextResponse.json({ success: true, data: endedContext })
      }

      case 'move-city': {
        const newContext = moveToCity(context, action.cityId)
        if (!newContext) {
          return NextResponse.json({ error: 'Ville inaccessible.' }, { status: 400 })
        }
        return NextResponse.json({ success: true, data: newContext })
      }

      case 'stay-in-city': {
        const city = context.currentCity
        if (!city) {
          return NextResponse.json({ error: 'Aucune ville en cours.' }, { status: 400 })
        }
        const newContext = renewMandate(context.mayor as Mayor, city)
        return NextResponse.json({ success: true, data: newContext })
      }

      case 'retire': {
        const result = retire(context.mayor as Mayor)
        return NextResponse.json({ success: true, data: result })
      }

      case 'get-accessible-cities': {
        const cities = getAccessibleCities(context.mayor as Mayor)
        return NextResponse.json({ success: true, data: cities })
      }

      default:
        return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'action de jeu.' }, { status: 500 })
  }
}