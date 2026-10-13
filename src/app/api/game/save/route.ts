import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import type { GameContext } from '@/types/game'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })
  }

  const body = await request.json()
  const ctx = body.context as GameContext

  if (!ctx?.mayor) {
    return NextResponse.json({ error: 'Contexte invalide.' }, { status: 400 })
  }

  const data = {
    userId: session.user.id,
    mayorName: ctx.mayor.name,
    origin: ctx.mayor.origin,
    year: ctx.mayor.year,
    career: JSON.stringify(ctx.mayor.career),
    stats: JSON.stringify(ctx.mayor.stats),
    currentCity: ctx.currentCity?.id ?? null,
    phase: ctx.phase,
    yearInMandate: ctx.yearInMandate,
  }

  const { gameSaves } = schema
  const existing = await db.select().from(gameSaves).where(eq(gameSaves.userId, session.user.id)).limit(1)

  if (existing.length > 0) {
    await db.update(gameSaves).set(data).where(eq(gameSaves.id, existing[0].id))
    return NextResponse.json({ success: true, message: 'Partie sauvegardée !' })
  } else {
    const id = crypto.randomUUID()
    await db.insert(gameSaves).values({ id, ...data })
    return NextResponse.json({ success: true, message: 'Partie sauvegardée !' })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })
  }

  const { gameSaves } = schema
  const saves = await db.select().from(gameSaves).where(eq(gameSaves.userId, session.user.id)).limit(1)

  if (saves.length === 0) {
    return NextResponse.json({ success: true, data: null })
  }

  const save = saves[0]
  return NextResponse.json({
    success: true,
    data: {
      id: save.id,
      mayorName: save.mayorName,
      origin: save.origin,
      year: save.year,
      currentCity: save.currentCity,
      phase: save.phase,
      yearInMandate: save.yearInMandate,
      createdAt: save.createdAt,
      updatedAt: save.updatedAt,
      career: JSON.parse(save.career),
      stats: JSON.parse(save.stats),
    },
  })
}