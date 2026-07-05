import { useMemo, useState } from 'react'
import { useReelStore } from '../stores/reelStore'
import ReelCard from '../components/ReelCard'
import type { Reel } from '../types/reel'

type SortKey = 'postedAt' | 'views' | 'likes' | 'engagementRate'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'postedAt', label: 'Más reciente' },
  { key: 'views', label: 'Más vistas' },
  { key: 'likes', label: 'Más likes' },
  { key: 'engagementRate', label: 'Más engagement' },
]

export default function Reels() {
  const reels = useReelStore(s => s.reels)
  const [sortKey, setSortKey] = useState<SortKey>('postedAt')
  const [topicFilter, setTopicFilter] = useState<string>('')

  const topics = useMemo(() => {
    const set = new Set<string>()
    reels.forEach(r => r.themes?.topics.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [reels])

  const filtered = useMemo(() => {
    let result: Reel[] = reels
    if (topicFilter) {
      result = result.filter(r => r.themes?.topics.includes(topicFilter))
    }
    return [...result].sort((a, b) => {
      if (sortKey === 'postedAt') return b.postedAt.localeCompare(a.postedAt)
      return b[sortKey] - a[sortKey]
    })
  }, [reels, sortKey, topicFilter])

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Reels ({filtered.length})</h1>

        <div className="flex gap-2">
          <select
            value={topicFilter}
            onChange={e => setTopicFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300"
          >
            <option value="">Todas las temáticas</option>
            {topics.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {filtered.map(reel => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </div>
  )
}
