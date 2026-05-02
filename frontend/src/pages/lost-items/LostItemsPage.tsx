import { Link } from 'react-router-dom'
import { ItemCard } from '../../components/cards/ItemCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { useLostItems } from '../../hooks/useLostItems'

export function LostItemsPage() {
  const { items, isLoading, error } = useLostItems()

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Lost items</h1>
        </div>
        <Link className="button button-primary" to="/lost-items/new">
          New lost item
        </Link>
      </div>
      {isLoading ? <p>Loading lost items...</p> : null}
      {error ? <EmptyState title="No live data yet" message={error} /> : null}
      {!isLoading && !error && items.length === 0 ? (
        <EmptyState title="No lost items reported" message="New reports will appear here." />
      ) : null}
      <div className="cards-grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} type="lost" />
        ))}
      </div>
    </section>
  )
}
