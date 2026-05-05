import { Link } from 'react-router-dom'

type EmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}

export function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#c3c5d7] bg-[#f3f3fe] p-8 text-center">
      <h2 className="text-xl font-semibold text-[#191b23]">{title}</h2>
      <p className="mt-2 text-[#737686]">{description}</p>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-[#003fb1] px-4 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
