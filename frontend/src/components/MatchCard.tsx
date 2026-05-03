import { formatDistanceToNow } from 'date-fns'
import type { ItemMatch } from '../types/models'
import { getItemTitle } from '../lib/mockData'

export function MatchCard({ match }: { match: ItemMatch }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{getItemTitle(match.lostItemId)} ↔ {getItemTitle(match.foundItemId)}</h3>
          <p className="mt-1 text-xs text-slate-600">Status: {match.status}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-emerald-700">{Math.round(match.score * 100)}%</div>
          <div className="text-xs text-slate-500">{formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}</div>
        </div>
      </div>
    </article>
  )
}
