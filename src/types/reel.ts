export interface MetricSnapshot {
  fetchedAt: string
  views: number
  likes: number
  comments: number
}

export interface ThemeTags {
  topics: string[]
  format: string
  hookType: string
  hasCta: boolean
  tone: string
}

export interface Reel {
  id: string
  shortcode: string
  url: string
  videoUrl: string
  caption: string
  postedAt: string
  durationSeconds: number
  thumbnailUrl: string
  views: number
  likes: number
  comments: number
  engagementRate: number
  history: MetricSnapshot[]
  transcript: string | null
  themes: ThemeTags | null
}
