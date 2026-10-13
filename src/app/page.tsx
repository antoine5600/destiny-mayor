'use client'

import { useState } from 'react'
import type { Origin, GameContext } from '@/types/game'

const ORIGINS: { id: Origin; label: string; emoji: string; desc: string }[] = [
  { id: 'rural', label: 'Rural', emoji: '🏡', desc: 'Proche des habitants, budget serré' },
  { id: 'urbain', label: 'Urbain', emoji: '🏙️', desc: 'Bon réseau, gestion budgétaire' },
  { id: 'academique', label: 'Académique', emoji: '🎓', desc: 'Compétences en éducation' },
  { id: 'entrepreneur', label: 'Entrepreneur', emoji: '💼', desc: 'Le budget n\'a pas de secrets' },
]

export default function Home() {
  const [name, setName] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | null>(null)
  const [gameContext, setGameContext] = useState<GameContext | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      if (!data.success) {
        setError(data.error || 'Erreur inconnue')
      } else {
        setGameContext(data.data)
      }
    } catch {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  // Écran de création
  if (!gameContext) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ★ Destiny Mayor ★
            </h1>
            <p className="text-slate-400">Écrivez votre légende politique</p>
          </div>

          {/* Nom */}
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

          {/* Origine */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Choisissez votre origine</p>
            <div className="grid grid-cols-2 gap-3">
              {ORIGINS.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrigin(o.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedOrigin === o.id
                      ? 'border-yellow-400 bg-slate-700'
                      : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <p className="font-semibold mt-1">{o.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Start */}
          <button
            onClick={startGame}
            disabled={!name.trim() || !selectedOrigin || loading}
            className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-300 hover:to-orange-400 transition-all"
          >
            {loading ? 'Création en cours...' : '★ Commencer ma carrière ★'}
          </button>

          {/* Stats preview */}
          {selectedOrigin && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-sm font-medium text-slate-400 mb-2">Stats de départ :</p>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div><span className="block text-yellow-400 font-bold text-lg">💰</span>Budget</div>
                <div><span className="block text-blue-400 font-bold text-lg">📊</span>Opinion</div>
                <div><span className="block text-green-400 font-bold text-lg">🏗️</span>Infra</div>
                <div><span className="block text-purple-400 font-bold text-lg">📚</span>Éduc</div>
                <div><span className="block text-red-400 font-bold text-lg">🛡️</span>Sécu</div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Dashboard du maire (placeholder pour phase 2)
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">★ Maire {gameContext.mayor?.name} ★</h1>
          <p className="text-slate-400">
            {gameContext.currentCity?.name} • {gameContext.yearInMandate + 1}/{gameContext.mandateLength} ans
          </p>
        </div>

        {/* Stats bars */}
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(gameContext.mayor?.stats ?? {}).map(([key, value]) => (
            <div key={key} className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">
                {key === 'budget' && '💰'}
                {key === 'opinion' && '📊'}
                {key === 'infrastructure' && '🏗️'}
                {key === 'education' && '📚'}
                {key === 'securite' && '🛡️'}
              </div>
              <div className="text-xs text-slate-400 capitalize mb-1">{key}</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                  style={{ width: `${value}%` }}
                />
              </div>
              <div className="text-sm font-bold">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}