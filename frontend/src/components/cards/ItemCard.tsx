import { Link } from 'react-router-dom'
import { formatDate, statusLabel } from '../../lib/utils'
import type { FoundItem, LostItem } from '../../types'

interface ItemCardProps {
  item: LostItem | FoundItem
  type: 'lost' | 'found'
}

export function ItemCard({ item, type }: ItemCardProps) {
  const date = type === 'lost' ? (item as LostItem).lostDate : (item as FoundItem).foundDate
  const href = type === 'lost' ? `/lost-items/${item.id}` : `/found-items/${item.id}`

  return (
    <article className="item-card">
      <div>
        <p className="eyebrow">{item.category}</p>
        <h3>{item.title}</h3>
      </div>
      <p>{item.description}</p>
      <dl>
        <div>
          <dt>Location</dt>
          <dd>{item.location}</dd>
        </div>
        <div>
          <dt>{type === 'lost' ? 'Lost' : 'Found'}</dt>
          <dd>{formatDate(date)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{statusLabel(item.status)}</dd>
        </div>
      </dl>
      <Link to={href}>View details</Link>
    </article>
  )
}
