import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
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
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#842c00]">
            <Search className="h-4 w-4" />
            Active recovery queue
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#191b23]">Lost items</h1>
          <p className="mt-2 text-[#434654]">Browse recent lost item reports and prioritize urgent recovery work.</p>
        </div>
        <Link to="/lost-items/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#003fb1] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,63,177,0.2)]">
          <Plus className="h-4 w-4" />
          Report lost item
        </Link>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {lostItems.length > 0 ? lostItems.map((item) => <ItemCard key={item.id} item={item} />) : <EmptyState title="No lost items" description="Lost reports will show here." actionLabel="Report one" actionTo="/lost-items/new" />}
      </div>
    </section>
  )
}
