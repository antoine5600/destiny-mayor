'use client'

import { useState, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import type { GameContext, CareerResult, Stats, Background, BackgroundQuestion } from '@/types/game'
import { CITIES, BACKGROUND_QUESTIONS, getBackgroundStats } from '@/lib/game-engine/data'
import { LockInput } from '@/components/ui/lock-input'
import { NeonEdgeButton } from '@/components/ui/neon-edge-button'

type ActionType =
  | { type: 'start-mandate'; cityId: string }
  | { type: 'advance-year' }
  | { type: 'resolve-event'; choiceIndex: number }
  | { type: 'end-mandate' }
  | { type: 'move-city'; cityId: string }
  | { type: 'stay-in-city' }
  | { type: 'retire' }
  | { type: 'get-accessible-cities' }

type CreationStep = 'name' | 'origins' | 'studies' | 'work' | 'preview'

/** Style partagé pour les boutons principaux (orange/doré) */
const BTN_PRIMARY = 'w-full py-3 rounded-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-300 hover:to-orange-400 transition-all'
/** Style pour les boutons secondaires (transparents avec bordure) */
const BTN_SECONDARY = 'w-full py-3 rounded-lg font-semibold border-2 border-slate-600 bg-slate-800 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all'

export default function Home() {
  const { data: session } = useSession()
  const [name, setName] = useState('')
  const [answers, setAnswers] = useState<Background>({ origins: '', studies: '', work: '' })
  const [step, setStep] = useState<CreationStep>('name')
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
        } else if (data.data?.destituted) {
          setCareerResult(data.data)
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
    if (!name.trim() || !answers.origins || !answers.studies || !answers.work) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), background: answers }),
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
        const { career, stats, mayorName, background, year, currentCity, phase, yearInMandate } = data.data
        const cityData = currentCity ? CITIES.find(c => c.id === currentCity) ?? null : null
        const ctx: GameContext = {
          mayor: { name: mayorName, background, birthYear: 2026, stats, career, currentCityId: currentCity, year, isRetired: false },
          currentCity: cityData,
          currentEvent: null,
          phase,
          yearInMandate,
          mandateLength: cityData ? (cityData.size === 'petit-village' || cityData.size === 'ville-moyenne' ? 6 : 5) : 6,
        }
        setGameCtx(ctx)
      } else { setError('Aucune sauvegarde trouvée.') }
    } catch { setError('Erreur de chargement.') }
  }

  function answerQuestion(questionId: keyof Background, choiceId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }))
    const nextSteps: Record<string, CreationStep> = {
      origins: 'studies',
      studies: 'work',
      work: 'preview',
    }
    setStep(nextSteps[questionId] || 'preview')
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

          <div className="flex gap-2 justify-center">
            {(['name', 'origins', 'studies', 'work', 'preview'] as CreationStep[]).map((s, i) => {
              const stepNames = ['Nom', 'Origines', 'Études', 'Métier', 'Récap']
              const currentIdx = ['name', 'origins', 'studies', 'work', 'preview'].indexOf(step)
              return (
                <div key={s} className={`h-2 rounded-full transition-all ${i <= currentIdx ? 'bg-yellow-400' : 'bg-slate-700'}`}
                  style={{ width: i === currentIdx ? '32px' : '16px' }} title={stepNames[i]} />
              )
            })}
          </div>

          {step === 'name' && (
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-5xl">📜</span>
                <h2 className="text-xl font-bold mt-2">Quel est le nom de votre maire ?</h2>
              </div>
              <LockInput
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jean Politique"
                maxLength={30}
                leftIcon={<span>📋</span>}
                description="Donnez un nom à votre futur maire"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && name.trim()) setStep('origins') }}
              />
              <button
                onClick={() => setStep('origins')}
                disabled={!name.trim()}
                className={BTN_PRIMARY}
              >
                Suivant →
              </button>
            </div>
          )}

          {(['origins', 'studies', 'work'] as string[]).includes(step) && (
            <BackgroundQuestionStep
              question={BACKGROUND_QUESTIONS.find(q => q.id === step)!}
              onSelect={(choiceId) => answerQuestion(step as keyof Background, choiceId)}
              selected={answers[step as keyof Background]}
            />
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-5xl">📋</span>
                <h2 className="text-xl font-bold mt-2">Récapitulatif</h2>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                <p><span className="text-slate-400">Nom :</span> <span className="font-semibold">{name.trim()}</span></p>
                {BACKGROUND_QUESTIONS.map(q => {
                  const choice = q.choices.find(c => c.id === answers[q.id as keyof Background])
                  return (
                    <p key={q.id}>
                      <span className="text-slate-400">{q.icon} {q.title} :</span>{' '}
                      <span>{choice?.icon} {choice?.label}</span>
                    </p>
                  )
                })}
              </div>

              <BackgroundPreviewStats bg={answers} />

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <NeonEdgeButton
                onClick={startGame}
                disabled={loading}
                speed={1.2}
                glow={true}
                className="w-full py-4 text-lg font-bold"
              >
                {loading ? '⏳ Création...' : '★ Commencer ma carrière ★'}
              </NeonEdgeButton>

              <button
                onClick={() => setStep('work')}
                className="w-full py-2 text-sm text-slate-400 hover:text-white transition-all"
              >
                ← Modifier mes réponses
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ===== Destitution =====
  if (careerResult && careerResult.destituted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white p-4 flex items-center justify-center">
        <div className="max-w-lg w-full space-y-6 text-center">
          <span className="text-7xl">💀</span>
          <h2 className="text-3xl font-bold text-red-500">Destitué !</h2>
          <p className="text-xl text-slate-300">Maire {careerResult.mayor.name}</p>
          <p className="text-slate-400">
            Votre carrière politique s'achève brutalement. Les électeurs vous ont retiré leur confiance et les affaires courantes sont confiées à votre adjoint.
          </p>
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-800">
            <p className="text-sm text-red-400">Aucune ville ne veut plus de vous comme maire.</p>
          </div>
          <button
            onClick={() => { setGameCtx(null); setCareerResult(null); setEventResult(null); }}
            className={BTN_PRIMARY}
          >
            ★ Nouvelle partie ★
          </button>
        </div>
      </div>
    )
  }

  // ===== Phase : Événement =====
  if (gameCtx.phase === 'evenement' && gameCtx.currentEvent) {
    const ev = gameCtx.currentEvent
    const currentStats = gameCtx.mayor?.stats
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <span className="text-6xl">⚡</span>
            <h2 className="text-2xl font-bold mt-2">{ev.title}</h2>
            <p className="text-slate-400 mt-2">{ev.description}</p>
          </div>
          {currentStats && (
            <div className="grid grid-cols-5 gap-1.5">
              {Object.entries(currentStats).map(([key, value]) => (
                <div key={key} className={`bg-slate-800 rounded-lg p-2 text-center ${value <= 0 ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
                  <div className="text-lg">{statEmoji(key)}</div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                    <div className={`h-1 rounded-full transition-all ${value <= 15 ? 'bg-red-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`} style={{ width: `${Math.max(0, value)}%` }} />
                  </div>
                  <div className="text-xs font-bold mt-1">{value}</div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-3">
            {ev.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => apiCall({ type: 'resolve-event', choiceIndex: i })}
                disabled={loading}
                className="w-full p-4 rounded-lg border-2 border-slate-600 bg-slate-800 hover:border-yellow-400 text-left transition-all disabled:opacity-50"
              >
                <p className="font-semibold">{choice.label}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {effectToTags(choice.effects).map((tag, j) => (
                    <span key={j} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      tag.direction === 'up' ? 'bg-green-900/50 text-green-400' :
                      tag.direction === 'down' ? 'bg-red-900/50 text-red-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {tag.icon}{tag.label}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-400 mt-2">{choice.description}</p>
              </button>
            ))}
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
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
            className={BTN_PRIMARY}
          >
            ★ Nouvelle partie ★
          </button>
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
              onClick={() => apiCall({ type: 'stay-in-city' })}
              disabled={loading}
              className={BTN_PRIMARY}
            >
              Rester à {gameCtx.currentCity?.name} 🔄
            </button>
            <button
              onClick={() => apiCall({ type: 'get-accessible-cities' })}
              disabled={loading}
              className={BTN_SECONDARY}
            >
              Changer de ville 🏙️
            </button>
            <button
              onClick={() => apiCall({ type: 'retire' })}
              disabled={loading}
              className={BTN_SECONDARY}
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

  // ===== Dashboard mandat =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
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

        {/* Stats compactes — 5 colonnes, sans effet magnétique */}
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(gameCtx.mayor?.stats ?? {}).map(([key, value]) => (
            <div key={key} className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-xl mb-1">{statEmoji(key)}</div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all" style={{ width: `${Math.min(100, value)}%` }} />
              </div>
              <div className="text-[10px] text-slate-400 capitalize mb-0.5">{statLabel(key)}</div>
              <div className="text-lg font-bold">{value}</div>
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
              className={BTN_PRIMARY + ' text-lg'}
            >
              {loading ? '⏳ Année en cours...' : "📅 Avancer d'un an"}
            </button>
          )}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>
    </div>
  )
}

// ===== Composant : une question du background =====
function BackgroundQuestionStep({
  question,
  onSelect,
  selected,
}: {
  question: BackgroundQuestion
  onSelect: (choiceId: string) => void
  selected: string
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-5xl">{question.icon}</span>
        <h2 className="text-xl font-bold mt-2">{question.title}</h2>
      </div>
      <div className="space-y-3">
        {question.choices.map(choice => (
          <button
            key={choice.id}
            onClick={() => onSelect(choice.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selected === choice.id
                ? 'border-yellow-400 bg-slate-700'
                : 'border-slate-600 bg-slate-800 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{choice.icon}</span>
              <div>
                <p className="font-semibold">{choice.label}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {effectToTags(choice.effects).map((tag, j) => (
                    <span key={j} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      tag.direction === 'up' ? 'bg-green-900/50 text-green-400' :
                      tag.direction === 'down' ? 'bg-red-900/50 text-red-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {tag.icon}{tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ===== Composant : mini tableau des stats =====
function BackgroundPreviewStats({ bg }: { bg: Background }) {
  const stats = getBackgroundStats(bg)
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <p className="text-sm font-medium text-slate-300 text-center mb-2">Stats de départ</p>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className="text-lg">{statEmoji(key)}</div>
            <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
              <div className="h-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${value}%` }} />
            </div>
            <div className="text-[10px] text-slate-400">{statLabel(key)}</div>
            <div className="text-xs font-bold mt-0.5">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Helpers UI =====
function statEmoji(key: string): string {
  const map: Record<string, string> = { budget: '💰', opinion: '📊', infrastructure: '🏗️', education: '📚', securite: '🛡️' }
  return map[key] || '📌'
}

function statLabel(key: string): string {
  const map: Record<string, string> = { budget: 'Budget', opinion: 'Opinion', infrastructure: 'Infra', education: 'Éduc', securite: 'Sécu' }
  return map[key] || key
}

function effectToTags(effects: Partial<Stats>): { icon: string; label: string; direction: 'up' | 'down' | 'none' }[] {
  const icons: Record<string, string> = { budget: '💰', opinion: '📊', infrastructure: '🏗️', education: '📚', securite: '🛡️' }
  const labels: Record<string, string> = { budget: 'Budget', opinion: 'Opinion', infrastructure: 'Infra', education: 'Éduc', securite: 'Sécu' }
  const result: { icon: string; label: string; direction: 'up' | 'down' | 'none' }[] = []
  for (const [key, value] of Object.entries(effects)) {
    if (value === 0 || value === undefined) continue
    const icon = icons[key] || '📌'
    const label = `${labels[key] || key} ${value > 0 ? '+' : ''}${value}`
    const direction = value > 0 ? 'up' : 'down'
    result.push({ icon, label, direction })
  }
  return result
}