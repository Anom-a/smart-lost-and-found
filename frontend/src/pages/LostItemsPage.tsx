import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ItemCard } from '../components/ItemCard'
import { LoadingState } from '../components/LoadingState'
import { fetchLostItems } from '../lib/apiData'

export function LostItemsPage() {
  const { data: lostItems = [], isLoading, isError } = useQuery({
    queryKey: ['lost-items'],
    queryFn: fetchLostItems,
  })

  if (isLoading) return <LoadingState message="Loading lost item reports..." />
  if (isError) return <ErrorState description="Unable to load lost item reports from the API." />

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
