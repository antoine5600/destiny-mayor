'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6 text-center">
        <span className="text-8xl">💥</span>
        <h1 className="text-4xl font-bold text-red-500">Crise municipale</h1>
        <p className="text-slate-400">
          Une erreur inattendue a paralysé la mairie. 
          Nos équipes techniques sont sur le coup.
        </p>
        <p className="text-xs text-slate-600">
          {error.digest && <>Référence : {error.digest}</>}
        </p>
        <button
          onClick={reset}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold hover:from-yellow-300 hover:to-orange-400 transition-all"
        >
          🔄 Réélire la mairie
        </button>
      </div>
    </div>
  )
}