import { useReelStore } from '../stores/reelStore'
import ReelCard from '../components/ReelCard'
import ThemeBadge from '../components/ThemeBadge'
import TranscriptViewer from '../components/TranscriptViewer'
import { formatCompactNumber, formatDate, formatPercent } from '../utils/formatters'

export default function Compare() {
  const reels = useReelStore(s => s.reels)
  const compareIds = useReelStore(s => s.compareIds)
  const toggleCompare = useReelStore(s => s.toggleCompare)
  const clearCompare = useReelStore(s => s.clearCompare)

  const selected = compareIds.map(id => reels.find(r => r.id === id)).filter(r => r !== undefined)

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Comparar reels</h1>
        {selected.length > 0 && (
          <button onClick={clearCompare} className="text-xs text-slate-400 hover:text-slate-200">
            Limpiar selección
          </button>
        )}
      </div>

      {selected.length === 0 ? (
        <>
          <p className="text-sm text-slate-500">
            Elige hasta 3 reels para comparar sus métricas, temáticas y transcript lado a lado.
          </p>
          <div className="grid grid-cols-5 gap-4">
            {reels.map(reel => (
              <ReelCard
                key={reel.id}
                reel={reel}
                selected={compareIds.includes(reel.id)}
                onToggleCompare={() => toggleCompare(reel.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0, 1fr))` }}>
          {selected.map(reel => (
            <div key={reel.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3">
              <div className="aspect-[9/16] bg-slate-900 rounded-lg overflow-hidden">
                {reel.thumbnailUrl && <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <p className="text-xs text-slate-400 line-clamp-3">{reel.caption || 'Sin caption'}</p>
              <p className="text-xs text-slate-500">{formatDate(reel.postedAt)}</p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Vistas:</span>{' '}
                  <span className="font-bold text-slate-200">{formatCompactNumber(reel.views)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Likes:</span>{' '}
                  <span className="font-bold text-slate-200">{formatCompactNumber(reel.likes)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Comentarios:</span>{' '}
                  <span className="font-bold text-slate-200">{formatCompactNumber(reel.comments)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Engagement:</span>{' '}
                  <span className="font-bold text-pink-300">{formatPercent(reel.engagementRate)}</span>
                </div>
              </div>

              {reel.themes && (
                <div className="flex flex-wrap gap-1">
                  {reel.themes.topics.map(t => (
                    <ThemeBadge key={t} label={t} variant="topic" />
                  ))}
                  <ThemeBadge label={reel.themes.format} variant="format" />
                  <ThemeBadge label={reel.themes.hookType} variant="hook" />
                </div>
              )}

              <TranscriptViewer transcript={reel.transcript} />

              <button
                onClick={() => toggleCompare(reel.id)}
                className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg py-1.5"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
