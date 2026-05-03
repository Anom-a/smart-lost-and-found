import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ItemCard } from '../components/ItemCard'
import { LoadingState } from '../components/LoadingState'
import { fetchFoundItems } from '../lib/apiData'

export function FoundItemsPage() {
  const { data: foundItems = [], isLoading, isError } = useQuery({
    queryKey: ['found-items'],
    queryFn: fetchFoundItems,
  })

  if (isLoading) return <LoadingState message="Loading found item reports..." />
  if (isError) return <ErrorState description="Unable to load found item reports from the API." />

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
