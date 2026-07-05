import { create } from 'zustand'
import type { Reel } from '../types/reel'
import type { Insights } from '../types/insights'
import type { ContentStrategy } from '../types/strategy'

interface ReelState {
  reels: Reel[]
  insights: Insights | null
  strategy: ContentStrategy | null
  loading: boolean
  error: string | null
  compareIds: string[]

  loadReels: () => Promise<void>
  loadInsights: () => Promise<void>
  loadStrategy: () => Promise<void>
  toggleCompare: (id: string) => void
  clearCompare: () => void
}

export const useReelStore = create<ReelState>((set, get) => ({
  reels: [],
  insights: null,
  strategy: null,
  loading: false,
  error: null,
  compareIds: [],

  loadReels: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch('/data/reels.json')
      if (!res.ok) throw new Error(`No se encontró /data/reels.json (status ${res.status})`)
      const data: Reel[] = await res.json()
      set({ reels: data, loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  loadInsights: async () => {
    try {
      const res = await fetch('/data/insights.json')
      if (!res.ok) return
      const data: Insights = await res.json()
      set({ insights: data })
    } catch {
      // insights are optional
    }
  },

  loadStrategy: async () => {
    try {
      const res = await fetch('/data/strategy.json')
      if (!res.ok) return
      const data: ContentStrategy = await res.json()
      set({ strategy: data })
    } catch {
      // strategy is optional
    }
  },

  toggleCompare: (id) => {
    const current = get().compareIds
    set({
      compareIds: current.includes(id)
        ? current.filter(c => c !== id)
        : [...current, id].slice(-3),
    })
  },

  clearCompare: () => set({ compareIds: [] }),
}))
