import { NavLink } from 'react-router-dom'
import { useReelStore } from '../stores/reelStore'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◉' },
  { to: '/reels', label: 'Reels', icon: '▤' },
  { to: '/themes', label: 'Temáticas', icon: '🏷' },
  { to: '/strategy', label: 'Estrategia', icon: '✨' },
  { to: '/compare', label: 'Comparar', icon: '⇄' },
]

export default function Sidebar() {
  const reels = useReelStore(s => s.reels)
  const insights = useReelStore(s => s.insights)

  return (
    <aside className="w-56 shrink-0 bg-slate-900 border-r border-slate-700/50 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="text-pink-400 font-bold text-lg tracking-tight">Reels Stats</div>
        <div className="text-slate-500 text-xs mt-0.5">
          {reels.length > 0 ? `${reels.length} reels` : 'Sin datos aún'}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-pink-600/20 text-pink-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {insights && (
        <div className="px-5 py-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500">Última sync</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {new Date(insights.generatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="mt-3 text-xs text-slate-600 leading-relaxed">
            Para actualizar:<br />
            <code className="text-slate-500">cd fetch && python sync.py</code>
          </div>
        </div>
      )}
    </aside>
  )
}
