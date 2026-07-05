export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatShortDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function formatRelativeTime(isoString: string): string {
  const now = new Date()
  const d = new Date(isoString)
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`
  return `Hace ${Math.floor(days / 365)} años`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function daysSince(isoString: string): number {
  return Math.max(1, Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000))
}
