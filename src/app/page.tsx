'use client'

import { useState, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import type { Origin, GameContext, CareerResult } from '@/types/game'

const ORIGINS: { id: Origin; label: string; emoji: string; desc: string }[] = [
  { id: 'rural', label: 'Rural', emoji: '🏡', desc: 'Proche des habitants, budget serré' },
  { id: 'urbain', label: 'Urbain', emoji: '🏙️', desc: 'Bon réseau, gestion budgétaire' },
  { id: 'academique', label: 'Académique', emoji: '🎓', desc: 'Compétences en éducation' },
  { id: 'entrepreneur', label: 'Entrepreneur', emoji: '💼', desc: 'Le budget n\'a pas de secrets' },
]

type ActionType =
  | { type: 'start-mandate'; cityId: string }
  | { type: 'advance-year' }
  | { type: 'resolve-event'; choiceIndex: number }
  | { type: 'end-mandate' }
  | { type: 'move-city'; cityId: string }
  | { type: 'retire' }
  | { type: 'get-accessible-cities' }

export default function Home() {
  const { data: session } = useSession()
  const [name, setName] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | null>(null)
  const [gameCtx, setGameCtx] = useState<GameContext | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [eventResult, setEventResult] = useState<string | null>(null)
  const [careerResult, setCareerResult] = useState<CareerResult | null>(null)
  const [accessibleCities, setAccessibleCities] = useState<{ id: string; name: string; size: string }[]>([])
  const [saveMsg, setSaveMsg] = useState('')

  const apiCall = useCallback(async (action: ActionType) => {
    if (!gameCtx) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: gameCtx, action }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Erreur')
      } else {
        if (action.type === 'retire') {
          setCareerResult(data.data)
        } else if (action.type === 'get-accessible-cities') {
          setAccessibleCities(data.data)
        } else {
          setGameCtx(data.data)
          if (data.eventResult) setEventResult(data.eventResult)
        }
      }
    } catch {
      setError('Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }, [gameCtx])

  async function startGame() {
    if (!name.trim() || !selectedOrigin) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), origin: selectedOrigin }),
      })
      const data = await res.json()
      if (!data.success) setError(data.error || 'Erreur')
      else setGameCtx(data.data)
    } catch {
      setError('Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  async function saveGame() {
    if (!session?.user?.id) { signIn('google'); return }
    setSaveMsg('')
    try {
      const res = await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: gameCtx }),
      })
      const data = await res.json()
      setSaveMsg(data.success ? '💾 Sauvegardé !' : data.error || 'Erreur')
    } catch { setSaveMsg('Erreur de sauvegarde.') }
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function loadGame() {
    if (!session?.user?.id) { signIn('google'); return }
    try {
      const res = await fetch('/api/game/save')
      const data = await res.json()
      if (data.success && data.data) {
        const { career, stats, mayorName, origin, year, currentCity, phase, yearInMandate } = data.data
        const ctx: GameContext = {
          mayor: { name: mayorName, origin, birthYear: 2026, stats, career, currentCityId: currentCity, year, isRetired: false },
          currentCity: currentCity ? { id: currentCity, name: currentCity, size: 'petit-village', difficulty: 'facile', population: 0, description: '' } : null,
          currentEvent: null,
          phase,
          yearInMandate,
          mandateLength: 6,
        }
        setGameCtx(ctx)
      } else { setError('Aucune sauvegarde trouvée.') }
    } catch { setError('Erreur de chargement.') }
  }

  // ===== Écran de création =====
  if (!gameCtx) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8">
          {/* Auth header */}
          <div className="flex justify-end gap-2">
            {session?.user ? (
              <div className="flex items-center gap-2">
                {session.user.image && <img src={session.user.image} className="w-7 h-7 rounded-full" alt="" />}
                <span className="text-xs text-slate-400">{session.user.name}</span>
                <button onClick={() => signOut()} className="text-xs text-red-400 hover:text-red-300">Déconnexion</button>
              </div>
            ) : (
              <button onClick={() => signIn('google')} className="text-xs bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-all">
                Connexion Google 🚪
              </button>
            )}
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ★ Destiny Mayor ★
            </h1>
            <p className="text-slate-400">Écrivez votre légende politique</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Nom de votre maire</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jean Politique"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
              maxLength={30}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Choisissez votre origine</p>
            <div className="grid grid-cols-2 gap-3">
              {ORIGINS.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrigin(o.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedOrigin === o.id ? 'border-yellow-400 bg-slate-700' : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <p className="font-semibold mt-1">{o.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            onClick={startGame}
            disabled={!name.trim() || !selectedOrigin || loading}
            className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-300 hover:to-orange-400 transition-all"
          >
            {loading ? 'Création...' : '★ Commencer ma carrière ★'}
          </button>
        </div>
      </div>
    )
  }

  // ===== Phase : Événement =====
  if (gameCtx.phase === 'evenement' && gameCtx.currentEvent) {
    const ev = gameCtx.currentEvent
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 flex items-center justify-center">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <span className="text-6xl">⚡</span>
            <h2 className="text-2xl font-bold mt-2">{ev.title}</h2>
            <p className="text-slate-400 mt-2">{ev.description}</p>
          </div>
          <div className="space-y-3">
            {ev.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => apiCall({ type: 'resolve-event', choiceIndex: i })}
                disabled={loading}
                className="w-full p-4 rounded-lg border-2 border-slate-600 bg-slate-800 hover:border-yellow-400 text-left transition-all disabled:opacity-50"
              >
                <p className="font-semibold">{choice.label}</p>
                <p className="text-sm text-slate-400 mt-1">{choice.description}</p>
              </button>
            ))}
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
      </div>
    )
  }

  // ===== Phase : Fin de mandat =====
  if (gameCtx.phase === 'fin-mandat') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 flex items-center justify-center">
        <div className="max-w-lg w-full space-y-6 text-center">
          <span className="text-6xl">📅</span>
          <h2 className="text-2xl font-bold">Fin du mandat</h2>
          <p className="text-slate-400">
            {gameCtx.mayor?.name}, votre mandat à {gameCtx.currentCity?.name} est terminé.
          </p>
          {eventResult && (
            <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-sm text-yellow-400">{eventResult}</p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => apiCall({ type: 'get-accessible-cities' })}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold transition-all disabled:opacity-50"
            >
              Changer de ville 🏙️
            </button>
            <button
              onClick={() => apiCall({ type: 'retire' })}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 font-semibold transition-all disabled:opacity-50"
            >
              Prendre sa retraite 🏁
            </button>
          </div>
          {accessibleCities.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-300">Villes accessibles :</p>
              {accessibleCities.map(city => (
                <button
                  key={city.id}
                  onClick={() => apiCall({ type: 'move-city', cityId: city.id })}
                  disabled={loading}
                  className="w-full p-3 rounded-lg border-2 border-slate-600 bg-slate-800 hover:border-green-400 text-left transition-all disabled:opacity-50"
                >
                  <span className="font-semibold">{city.name}</span>
                  <span className="text-xs text-slate-400 ml-2">({city.size})</span>
                </button>
              ))}
              <button
                onClick={() => setAccessibleCities([])}
                className="w-full py-2 text-sm text-slate-400 hover:text-white transition-all"
              >
                Annuler
              </button>
            </div>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    )
  }

  // ===== Résultat de carrière =====
  if (careerResult) {
    const gradeColors: Record<string, string> = { S: 'text-yellow-400', A: 'text-green-400', B: 'text-blue-400', C: 'text-purple-400', D: 'text-orange-400', E: 'text-red-400' }
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 flex items-center justify-center">
        <div className="max-w-lg w-full space-y-6 text-center">
          <span className="text-6xl">🏛️</span>
          <h2 className="text-3xl font-bold">Carrière terminée</h2>
          <p className="text-xl">Maire {careerResult.mayor.name}</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">{careerResult.totalYears}</p>
              <p className="text-xs text-slate-400">Années</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">{careerResult.citiesGoverned}</p>
              <p className="text-xs text-slate-400">Villes</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className={`text-2xl font-bold ${gradeColors[careerResult.grade]}`}>{careerResult.grade}</p>
              <p className="text-xs text-slate-400">Grade</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400">Score final</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {careerResult.finalScore}
            </p>
          </div>
          <button
            onClick={() => { setGameCtx(null); setCareerResult(null); setEventResult(null); setAccessibleCities([]) }}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold hover:from-yellow-300 hover:to-orange-400 transition-all"
          >
            ★ Nouvelle partie ★
          </button>
        </div>
      </div>
    )
  }

  // ===== Dashboard mandat =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Auth bar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button onClick={saveGame} className="text-xs bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all">💾 Sauvegarder</button>
            <button onClick={loadGame} className="text-xs bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all">📂 Charger</button>
          </div>
          {session?.user ? (
            <button onClick={() => signOut()} className="text-xs text-red-400 hover:text-red-300">Déconnexion</button>
          ) : (
            <button onClick={() => signIn('google')} className="text-xs bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20">🚪 Connexion</button>
          )}
        </div>
        {saveMsg && <p className="text-green-400 text-sm text-center">{saveMsg}</p>}
        <div className="text-center">
          <h1 className="text-2xl font-bold">★ Maire {gameCtx.mayor?.name} ★</h1>
          <p className="text-slate-400">
            🏙️ {gameCtx.currentCity?.name} • Année {gameCtx.yearInMandate}/{gameCtx.mandateLength}
          </p>
          <p className="text-xs text-slate-500">~ {gameCtx.mayor?.year} après J.-C. ~</p>
        </div>

        {eventResult && (
          <div className="p-3 rounded-lg bg-slate-800 border border-yellow-400/30 text-sm text-center animate-pulse">
            {eventResult}
          </div>
        )}

        <div className="grid grid-cols-5 gap-2">
          {Object.entries(gameCtx.mayor?.stats ?? {}).map(([key, value]) => (
            <div key={key} className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-xl mb-1">{statEmoji(key)}</div>
              <div className="text-[10px] text-slate-400 capitalize mb-1">{statLabel(key)}</div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all" style={{ width: `${value}%` }} />
              </div>
              <div className="text-xs font-bold">{value}</div>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-400 text-center italic">
          {gameCtx.currentCity?.description}
        </p>

        <div className="space-y-3">
          {gameCtx.phase === 'carriere' && (
            <button
              onClick={() => { setEventResult(null); apiCall({ type: 'advance-year' }) }}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all disabled:opacity-50"
            >
              {loading ? '⏳ Année en cours...' : '📅 Avancer d\'un an'}
            </button>
          )}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>
    </div>
  )
}

function statEmoji(key: string): string {
  const map: Record<string, string> = { budget: '💰', opinion: '📊', infrastructure: '🏗️', education: '📚', securite: '🛡️' }
  return map[key] || '📌'
}

function statLabel(key: string): string {
  const map: Record<string, string> = { budget: 'Budget', opinion: 'Opinion', infrastructure: 'Infra', education: 'Éduc', securite: 'Sécu' }
  return map[key] || key
}