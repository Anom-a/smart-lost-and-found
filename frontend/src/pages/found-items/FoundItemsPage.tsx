import { Link } from 'react-router-dom'
import { ItemCard } from '../../components/cards/ItemCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { useFoundItems } from '../../hooks/useFoundItems'

export function FoundItemsPage() {
  const { items, isLoading, error } = useFoundItems()

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Found items</h1>
        </div>
        <Link className="button button-primary" to="/found-items/new">
          New found item
        </Link>
      </div>
      {isLoading ? <p>Loading found items...</p> : null}
      {error ? <EmptyState title="No live data yet" message={error} /> : null}
      {!isLoading && !error && items.length === 0 ? (
        <EmptyState title="No found items reported" message="Recovered items will appear here." />
      ) : null}
      <div className="cards-grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} type="found" />
        ))}
      </div>
    </section>
  )
}
