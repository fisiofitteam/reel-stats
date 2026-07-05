export interface ThemePerformance {
  key: string
  count: number
  avgViews: number
  avgLikes: number
  avgComments: number
  avgEngagementRate: number
}

export interface Insights {
  generatedAt: string
  totalReels: number
  avgEngagementRate: number
  bestReelId: string | null
  worstReelId: string | null
  byTopic: ThemePerformance[]
  byFormat: ThemePerformance[]
  byHookType: ThemePerformance[]
}
