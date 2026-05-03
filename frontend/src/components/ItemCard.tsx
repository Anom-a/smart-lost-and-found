import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import type { Item } from '../types/models'

const statusStyles: Record<Item['status'], string> = {
  open: 'bg-blue-100 text-blue-700',
  available: 'bg-amber-100 text-amber-700',
  claimed: 'bg-purple-100 text-purple-700',
  closed: 'bg-emerald-100 text-emerald-700',
}

export function ItemCard({ item }: { item: Item }) {
  const detailPath = item.type === 'lost' ? `/lost-items/${item.id}` : `/found-items/${item.id}`

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[item.status]}`}>
          {item.status}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-slate-700">Category</dt>
          <dd>{item.category}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-700">Date</dt>
          <dd>{format(new Date(item.date), 'MMM d, yyyy')}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-700">Location</dt>
          <dd>{item.location}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-700">Reported by</dt>
          <dd>{item.reportedBy}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-slate-600">{item.description}</p>
      <Link to={detailPath} className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800">
        View details
      </Link>
    </article>
  )
}
