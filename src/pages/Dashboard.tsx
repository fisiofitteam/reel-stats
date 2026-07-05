import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'
import { useReelStore } from '../stores/reelStore'
import MetricCard from '../components/MetricCard'
import PerformanceRow from '../components/PerformanceRow'
import { formatCompactNumber, formatPercent, formatShortDate } from '../utils/formatters'

export default function Dashboard() {
  const reels = useReelStore(s => s.reels)
  const insights = useReelStore(s => s.insights)
  const loading = useReelStore(s => s.loading)
  const error = useReelStore(s => s.error)

  if (loading) return <div className="p-8 text-slate-400">Cargando...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>
  if (reels.length === 0) {
    return (
      <div className="p-8 text-slate-400">
        No hay datos todavía. Ejecuta <code className="text-pink-300">cd fetch && python sync.py</code> para
        sincronizar tus reels.
      </div>
    )
  }

  const byEngagement = [...reels].sort((a, b) => b.engagementRate - a.engagementRate)
  const top5 = byEngagement.slice(0, 5)
  const bottom5 = byEngagement.slice(-5).reverse()

  const trend = [...reels]
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt))
    .map(r => ({ date: formatShortDate(r.postedAt), Engagement: Math.round(r.engagementRate * 10000) / 100 }))

  return (
    <div className="p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Reels" value={insights?.totalReels ?? reels.length} />
        <MetricCard
          label="Engagement medio"
          value={formatPercent(insights?.avgEngagementRate ?? 0)}
          color="#e1306c"
        />
        <MetricCard
          label="Total vistas"
          value={formatCompactNumber(reels.reduce((sum, r) => sum + r.views, 0))}
        />
        <MetricCard
          label="Total likes"
          value={formatCompactNumber(reels.reduce((sum, r) => sum + r.likes, 0))}
        />
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Engagement rate en el tiempo</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} unit="%" />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            <Line type="monotone" dataKey="Engagement" stroke="#e1306c" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">Lo que más funciona vs. lo que menos</h2>
          <div className="flex gap-3">
            <Link to="/strategy" className="text-xs text-pink-300 hover:underline">
              Ver estrategia →
            </Link>
            <Link to="/reels" className="text-xs text-pink-300 hover:underline">
              Ver todos →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-good font-medium uppercase tracking-wider">▲ Mejor engagement</div>
            {top5.map(reel => (
              <PerformanceRow key={reel.id} reel={reel} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs text-bad font-medium uppercase tracking-wider">▼ Peor engagement</div>
            {bottom5.map(reel => (
              <PerformanceRow key={reel.id} reel={reel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
