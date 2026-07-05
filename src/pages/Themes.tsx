import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useReelStore } from '../stores/reelStore'
import type { ThemePerformance } from '../types/insights'

function ThemeChart({ title, data }: { title: string; data: ThemePerformance[] }) {
  const chartData = data.map(d => ({
    name: d.key,
    'Engagement %': Math.round(d.avgEngagementRate * 10000) / 100,
    reels: d.count,
  }))

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-slate-300 mb-4">{title}</h2>
      {chartData.length === 0 ? (
        <div className="text-sm text-slate-500 py-8 text-center">
          Aún no hay reels con temáticas analizadas.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#64748b" fontSize={12} unit="%" />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={120} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              formatter={(value, name, props) => [
                `${value}% (${(props.payload as { reels: number }).reels} reels)`,
                name,
              ]}
            />
            <Bar dataKey="Engagement %" fill="#e1306c" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default function Themes() {
  const insights = useReelStore(s => s.insights)

  if (!insights) {
    return <div className="p-8 text-slate-400">No hay insights todavía.</div>
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-100">Temáticas</h1>
      <p className="text-sm text-slate-500 -mt-4">
        Rendimiento medio (engagement rate) por temática, formato y tipo de gancho, para ver qué le gusta más a tu
        audiencia.
      </p>

      <ThemeChart title="Por temática" data={insights.byTopic} />
      <ThemeChart title="Por formato" data={insights.byFormat} />
      <ThemeChart title="Por tipo de gancho" data={insights.byHookType} />
    </div>
  )
}
