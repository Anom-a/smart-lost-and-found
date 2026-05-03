import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ItemCard } from '../components/ItemCard'
import { items } from '../lib/mockData'

export function LostItemsPage() {
  const lostItems = items.filter((item) => item.type === 'lost')

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Lost items</h1>
          <p className="text-slate-600">Browse recent lost item reports.</p>
        </div>
        <Link to="/lost-items/new" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Report lost item</Link>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {lostItems.length > 0 ? lostItems.map((item) => <ItemCard key={item.id} item={item} />) : <EmptyState title="No lost items" description="Lost reports will show here." actionLabel="Report one" actionTo="/lost-items/new" />}
      </div>
    </section>
  )
}
