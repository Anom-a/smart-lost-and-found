import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ItemCard } from '../components/ItemCard'
import { items } from '../lib/mockData'

export function FoundItemsPage() {
  const foundItems = items.filter((item) => item.type === 'found')

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Found items</h1>
          <p className="text-slate-600">Browse recent found item reports.</p>
        </div>
        <Link to="/found-items/new" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Report found item</Link>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {foundItems.length > 0 ? foundItems.map((item) => <ItemCard key={item.id} item={item} />) : <EmptyState title="No found items" description="Found reports will show here." actionLabel="Report one" actionTo="/found-items/new" />}
      </div>
    </section>
  )
}
