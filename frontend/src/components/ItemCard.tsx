import { format } from 'date-fns'
import { CalendarDays, MapPin, Phone, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Item } from '../types/models'

const statusStyles: Record<Item['status'], string> = {
  open: 'bg-[#ffeadf] text-[#842c00]',
  available: 'bg-[#dbe1ff] text-[#003dab]',
  claimed: 'bg-[#ffdad6] text-[#93000a]',
  closed: 'bg-[#85f8c4] text-[#005137]',
}

const typeStyles: Record<Item['type'], string> = {
  lost: 'bg-[#ffeadf] text-[#842c00]',
  found: 'bg-[#dbe1ff] text-[#003dab]',
}

export function ItemCard({ item, showViewDetails = true }: { item: Item; showViewDetails?: boolean }) {
  const detailPath = item.type === 'lost' ? `/lost-items/${item.id}` : `/found-items/${item.id}`

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e2e1ed] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="relative h-48 overflow-hidden bg-[#f3f3fe]">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={`${item.title} image`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-[#737686]">No image uploaded for this item.</div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${typeStyles[item.type]}`}>
            {item.type}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[item.status]}`}>
            {item.status}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[#737686]">{item.category}</p>
            <h3 className="mt-1 text-xl font-semibold leading-7 text-[#191b23]">{item.title}</h3>
          </div>
        </div>
        <dl className="mt-4 grid gap-3 text-sm text-[#434654]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#003fb1]" />
            <dt className="sr-only">Location</dt>
            <dd>{item.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#003fb1]" />
            <dt className="sr-only">Date</dt>
            <dd>{format(new Date(item.date), 'MMM d, yyyy')}</dd>
          </div>
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-[#003fb1]" />
            <dt className="sr-only">Reported by</dt>
            <dd>{item.reportedBy}</dd>
          </div>
          {item.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#003fb1]" />
              <dt className="sr-only">Contact</dt>
              <dd>{item.contactPhone}</dd>
            </div>
          )}
        </dl>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#737686]">{item.description}</p>
        {showViewDetails && (
          <Link to={detailPath} className="mt-5 inline-flex h-10 items-center rounded-lg border border-[#c3c5d7] px-4 text-sm font-semibold text-[#003fb1] transition hover:border-[#003fb1] hover:bg-[#f3f3fe]">
            View details
          </Link>
        )}
      </div>
    </article>
  )
}
