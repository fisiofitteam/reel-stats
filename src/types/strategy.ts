export interface ContentScript {
  title: string
  hook: string
  script: string
  topic: string
  inspiredBy: string
}

export interface ContentIdea {
  title: string
  pitch: string
  format: string
  inspiredBy: string
}

export interface ContentStrategy {
  generatedAt: string
  basedOnReelIds: string[]
  report: string
  scripts: ContentScript[]
  ideas: ContentIdea[]
}
