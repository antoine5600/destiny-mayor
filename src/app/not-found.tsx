'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6 text-center">
        <span className="text-8xl">🏛️</span>
        <h1 className="text-6xl font-bold text-yellow-400">404</h1>
        <h2 className="text-2xl font-semibold">Ville introuvable</h2>
        <p className="text-slate-400">
          Cette page n'existe pas dans notre république. 
          Peut-être a-t-elle été dissoute par décret ?
        </p>
        <Link
          href="/"
          className="inline-block w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold hover:from-yellow-300 hover:to-orange-400 transition-all"
        >
          ★ Retour à la mairie ★
        </Link>
      </div>
    </div>
  )
}