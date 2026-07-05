interface TranscriptViewerProps {
  transcript: string | null
}

export default function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  if (!transcript) {
    return <div className="text-sm text-slate-500 italic">Sin transcript todavía.</div>
  }

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
      {transcript}
    </div>
  )
}
