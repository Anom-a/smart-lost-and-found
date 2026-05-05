import { formatDistanceToNow } from 'date-fns'
import { Clock3, GitCompareArrows } from 'lucide-react'
import type { ItemMatch } from '../types/models'

const statusStyles: Record<ItemMatch['status'], string> = {
  pending: 'bg-[#ffeadf] text-[#842c00]',
  reviewed: 'bg-[#dbe1ff] text-[#003dab]',
  confirmed: 'bg-[#85f8c4] text-[#005137]',
}

export function MatchCard({ match }: { match: ItemMatch }) {
  const lostTitle = match.lostItemTitle ?? `Lost item #${match.lostItemId}`
  const foundTitle = match.foundItemTitle ?? `Found item #${match.foundItemId}`
  const score = Math.round(match.score * 100)

  return (
    <article className="rounded-2xl border border-[#e2e1ed] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e1ed] bg-[#f3f3fe] px-5 py-4">
        <span className="rounded-full bg-[#003fb1] px-3 py-1 text-xs font-semibold text-white">{score}% Match Probability</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[match.status]}`}>{match.status}</span>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-[#842c00]">Lost report</p>
          <h3 className="mt-1 text-lg font-semibold text-[#191b23]">{lostTitle}</h3>
          <p className="mt-1 text-sm text-[#737686]">Report #{match.lostItemId}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dbe1ff] text-[#003fb1]">
          <GitCompareArrows className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-[#003dab]">Found report</p>
          <h3 className="mt-1 text-lg font-semibold text-[#191b23]">{foundTitle}</h3>
          <p className="mt-1 text-sm text-[#737686]">Report #{match.foundItemId}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-[#e2e1ed] px-5 py-3 text-sm text-[#737686]">
        <Clock3 className="h-4 w-4" />
        Generated {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
      </div>
    </article>
  )
}
