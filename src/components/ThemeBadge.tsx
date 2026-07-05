interface ThemeBadgeProps {
  label: string
  variant?: 'topic' | 'format' | 'hook'
}

const VARIANT_CLASSES: Record<NonNullable<ThemeBadgeProps['variant']>, string> = {
  topic: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
  format: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  hook: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
}

export default function ThemeBadge({ label, variant = 'topic' }: ThemeBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${VARIANT_CLASSES[variant]}`}>
      {label}
    </span>
  )
}
