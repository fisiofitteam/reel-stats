import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReelStore } from '../stores/reelStore'
import ThemeBadge from '../components/ThemeBadge'
import { formatDate } from '../utils/formatters'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-2 py-1"
    >
      {copied ? 'Copiado ✓' : 'Copiar guion'}
    </button>
  )
}

export default function Strategy() {
  const strategy = useReelStore(s => s.strategy)
  const reels = useReelStore(s => s.reels)

  if (!strategy) {
    return (
      <div className="p-8 flex flex-col gap-3 text-slate-400">
        <h1 className="text-2xl font-bold text-slate-100">Estrategia</h1>
        <p>Aún no hay un informe de estrategia generado.</p>
        <p>
          Ejecuta esto desde la carpeta del proyecto para generarlo a partir de tus reels con mejor rendimiento:
        </p>
        <code className="text-pink-300 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 w-fit">
          python3 fetch/generate_strategy.py
        </code>
      </div>
    )
  }

  const basedOnReels = strategy.basedOnReelIds
    .map(id => reels.find(r => r.id === id))
    .filter(r => r !== undefined)

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Estrategia</h1>
        <span className="text-xs text-slate-500">Generado {formatDate(strategy.generatedAt)}</span>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Qué está funcionando</h2>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{strategy.report}</p>

        {basedOnReels.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="text-xs text-slate-500 mb-2">Basado en {basedOnReels.length} reels de referencia:</div>
            <div className="flex flex-wrap gap-2">
              {basedOnReels.map(r => (
                <Link
                  key={r.id}
                  to={`/reels/${r.id}`}
                  className="text-xs text-pink-300 hover:underline bg-pink-500/10 border border-pink-500/30 rounded-full px-2 py-0.5"
                >
                  {r.caption?.slice(0, 30) || r.shortcode}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Guiones nuevos sugeridos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategy.scripts.map((s, i) => (
            <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <ThemeBadge label={s.topic} variant="topic" />
                <CopyButton text={`${s.title}\n\n${s.script}`} />
              </div>
              <h3 className="font-bold text-slate-100">{s.title}</h3>
              <p className="text-xs text-pink-300 italic">"{s.hook}"</p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{s.script}</p>
              <p className="text-xs text-slate-500 mt-auto pt-2 border-t border-slate-700/50">
                Inspirado en: {s.inspiredBy}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Ideas de contenido nuevas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategy.ideas.map((idea, i) => (
            <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100">{idea.title}</h3>
                <ThemeBadge label={idea.format} variant="format" />
              </div>
              <p className="text-sm text-slate-300">{idea.pitch}</p>
              <p className="text-xs text-slate-500 mt-auto pt-2 border-t border-slate-700/50">
                Inspirado en: {idea.inspiredBy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
