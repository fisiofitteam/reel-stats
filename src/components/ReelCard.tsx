import { Link } from 'react-router-dom'
import type { Reel } from '../types/reel'
import { formatCompactNumber, formatPercent, formatShortDate } from '../utils/formatters'
import ThemeBadge from './ThemeBadge'

interface ReelCardProps {
  reel: Reel
  selected?: boolean
  onToggleCompare?: () => void
}

export default function ReelCard({ reel, selected, onToggleCompare }: ReelCardProps) {
  return (
    <div
      className={`bg-slate-800/60 border rounded-xl overflow-hidden flex flex-col transition-colors ${
        selected ? 'border-pink-500' : 'border-slate-700/50'
      }`}
    >
      <Link to={`/reels/${reel.id}`} className="block aspect-[9/16] bg-slate-900 relative overflow-hidden">
        {reel.thumbnailUrl && (
          <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs text-white">
          {formatShortDate(reel.postedAt)}
        </div>
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-xs text-slate-400 line-clamp-2 min-h-[2rem]">{reel.caption || 'Sin caption'}</p>

        <div className="grid grid-cols-3 gap-1 text-center text-xs">
          <div>
            <div className="font-bold text-slate-200 tabular-nums">{formatCompactNumber(reel.views)}</div>
            <div className="text-slate-500">vistas</div>
          </div>
          <div>
            <div className="font-bold text-slate-200 tabular-nums">{formatCompactNumber(reel.likes)}</div>
            <div className="text-slate-500">likes</div>
          </div>
          <div>
            <div className="font-bold text-pink-300 tabular-nums">{formatPercent(reel.engagementRate)}</div>
            <div className="text-slate-500">eng.</div>
          </div>
        </div>

        {reel.themes && (
          <div className="flex flex-wrap gap-1">
            {reel.themes.topics.slice(0, 2).map(topic => (
              <ThemeBadge key={topic} label={topic} variant="topic" />
            ))}
          </div>
        )}

        {onToggleCompare && (
          <button
            onClick={onToggleCompare}
            className={`mt-auto text-xs px-2 py-1 rounded-lg border transition-colors ${
              selected
                ? 'bg-pink-600/30 border-pink-500 text-pink-200'
                : 'border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {selected ? 'Quitar de comparar' : 'Comparar'}
          </button>
        )}
      </div>
    </div>
  )
}
