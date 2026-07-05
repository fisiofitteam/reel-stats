import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { MetricSnapshot } from '../types/reel'
import { formatShortDate } from '../utils/formatters'

interface GrowthChartProps {
  history: MetricSnapshot[]
}

export default function GrowthChart({ history }: GrowthChartProps) {
  if (history.length < 2) {
    return (
      <div className="text-sm text-slate-500 py-8 text-center">
        Aún no hay suficiente histórico para ver la evolución (ejecuta sync.py varias veces a lo largo del tiempo).
      </div>
    )
  }

  const data = history.map(h => ({
    date: formatShortDate(h.fetchedAt),
    Vistas: h.views,
    Likes: h.likes,
    Comentarios: h.comments,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
        <Line type="monotone" dataKey="Vistas" stroke="#e1306c" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Likes" stroke="#fd8d32" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Comentarios" stroke="#833ab4" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
