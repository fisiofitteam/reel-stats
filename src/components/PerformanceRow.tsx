import { Link } from 'react-router-dom'
import type { Reel } from '../types/reel'
import { formatPercent } from '../utils/formatters'
import ThemeBadge from './ThemeBadge'

interface PerformanceRowProps {
  reel: Reel
}

export default function PerformanceRow({ reel }: PerformanceRowProps) {
  return (
    <Link
      to={`/reels/${reel.id}`}
      className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-lg p-2 hover:border-slate-600 transition-colors"
    >
      <div className="w-10 h-14 shrink-0 bg-slate-900 rounded overflow-hidden">
        {reel.thumbnailUrl && <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-xs text-slate-300 truncate">{reel.caption || 'Sin caption'}</p>
        <div className="flex flex-wrap gap-1">
          {reel.themes?.topics.slice(0, 1).map(t => <ThemeBadge key={t} label={t} variant="topic" />)}
          {reel.themes?.format && <ThemeBadge label={reel.themes.format} variant="format" />}
          {reel.themes?.hookType && <ThemeBadge label={reel.themes.hookType} variant="hook" />}
        </div>
      </div>
      <div className="text-sm font-bold text-pink-300 tabular-nums shrink-0">{formatPercent(reel.engagementRate)}</div>
    </Link>
  )
}
