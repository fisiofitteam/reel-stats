import { Link, useParams } from 'react-router-dom'
import { useReelStore } from '../stores/reelStore'
import MetricCard from '../components/MetricCard'
import GrowthChart from '../components/GrowthChart'
import TranscriptViewer from '../components/TranscriptViewer'
import ThemeBadge from '../components/ThemeBadge'
import { formatCompactNumber, formatDate, formatDuration, formatPercent } from '../utils/formatters'

export default function ReelDetail() {
  const { id } = useParams<{ id: string }>()
  const reels = useReelStore(s => s.reels)
  const reel = reels.find(r => r.id === id)

  if (!reel) {
    return (
      <div className="p-8 text-slate-400">
        Reel no encontrado. <Link to="/reels" className="text-pink-300 hover:underline">Volver a Reels</Link>
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <Link to="/reels" className="text-sm text-pink-300 hover:underline w-fit">
        ← Volver a Reels
      </Link>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        <div className="aspect-[9/16] bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50">
          {reel.thumbnailUrl && <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <a href={reel.url} target="_blank" rel="noreferrer" className="text-pink-300 hover:underline text-sm">
              Ver en Instagram ↗
            </a>
            <p className="text-slate-300 mt-2">{reel.caption || 'Sin caption'}</p>
            <p className="text-xs text-slate-500 mt-1">
              {formatDate(reel.postedAt)} · {formatDuration(reel.durationSeconds)}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <MetricCard label="Vistas" value={formatCompactNumber(reel.views)} />
            <MetricCard label="Likes" value={formatCompactNumber(reel.likes)} />
            <MetricCard label="Comentarios" value={formatCompactNumber(reel.comments)} />
            <MetricCard label="Engagement" value={formatPercent(reel.engagementRate)} color="#e1306c" />
          </div>

          {reel.themes && (
            <div className="flex flex-wrap gap-1.5">
              {reel.themes.topics.map(t => (
                <ThemeBadge key={t} label={t} variant="topic" />
              ))}
              <ThemeBadge label={reel.themes.format} variant="format" />
              <ThemeBadge label={reel.themes.hookType} variant="hook" />
              {reel.themes.hasCta && <ThemeBadge label="Con CTA" variant="format" />}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-2">Evolución de métricas</h2>
        <GrowthChart history={reel.history} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-2">Transcript</h2>
        <TranscriptViewer transcript={reel.transcript} />
      </div>
    </div>
  )
}
