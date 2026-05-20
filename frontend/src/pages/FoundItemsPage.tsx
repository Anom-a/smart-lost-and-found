import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Inbox, Plus } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ItemCard } from '../components/ItemCard'
import { LoadingState } from '../components/LoadingState'
import { fetchFoundItems } from '../lib/apiData'

export function FoundItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || 'available'

  const { data: foundItems = [], isLoading, isError } = useQuery({
    queryKey: ['found-items', statusFilter],
    queryFn: () => fetchFoundItems(statusFilter),
  })

  const handleFilterChange = (status: string) => {
    setSearchParams({ status })
  }

  if (isLoading) return <LoadingState message="Loading found item reports..." />
  if (isError) return <ErrorState description="Unable to load found item reports from the API." />

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#003fb1]">
            <Inbox className="h-4 w-4" />
            Intake inventory
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#191b23]">Found items</h1>
          <p className="mt-2 text-[#434654]">Review available found items and move ownership claims forward.</p>
        </div>
        <Link to="/found-items/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#003fb1] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,63,177,0.2)]">
          <Plus className="h-4 w-4" />
          Report found item
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('available')}
          className={`inline-flex h-10 items-center justify-center px-5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            statusFilter === 'available'
              ? 'bg-[#003fb1] text-white shadow-[0_4px_12px_rgba(0,63,177,0.15)]'
              : 'bg-white border border-[#e2e1ed] text-[#434654] hover:bg-[#f3f3fe]'
          }`}
        >
          Available
        </button>
        <button
          onClick={() => handleFilterChange('closed')}
          className={`inline-flex h-10 items-center justify-center px-5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            statusFilter === 'closed'
              ? 'bg-[#003fb1] text-white shadow-[0_4px_12px_rgba(0,63,177,0.15)]'
              : 'bg-white border border-[#e2e1ed] text-[#434654] hover:bg-[#f3f3fe]'
          }`}
        >
          Closed
        </button>
        <button
          onClick={() => handleFilterChange('all')}
          className={`inline-flex h-10 items-center justify-center px-5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            statusFilter === 'all'
              ? 'bg-[#003fb1] text-white shadow-[0_4px_12px_rgba(0,63,177,0.15)]'
              : 'bg-white border border-[#e2e1ed] text-[#434654] hover:bg-[#f3f3fe]'
          }`}
        >
          All
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {foundItems.length > 0 ? (
          foundItems.map((item) => <ItemCard key={item.id} item={item} />)
        ) : (
          <EmptyState
            title="No found items"
            description={`Found reports with status "${statusFilter}" will show here.`}
            actionLabel="Report one"
            actionTo="/found-items/new"
          />
        )}
      </div>
    </section>
  )
}
