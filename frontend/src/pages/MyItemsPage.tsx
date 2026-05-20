import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShieldAlert, Inbox, Loader2 } from 'lucide-react'
import { getMyLostItems, getMyFoundItems } from '../lib/api'
import { ItemCard } from '../components/ItemCard'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import type { Item } from '../types/models'

export function MyItemsPage() {
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost')

  // Query for Lost Items
  const {
    data: lostResponse,
    isLoading: isLostLoading,
    isError: isLostError,
  } = useQuery({
    queryKey: ['my-lost-items'],
    queryFn: getMyLostItems,
    enabled: activeTab === 'lost',
  })

  // Query for Found Items
  const {
    data: foundResponse,
    isLoading: isFoundLoading,
    isError: isFoundError,
  } = useQuery({
    queryKey: ['my-found-items'],
    queryFn: getMyFoundItems,
    enabled: activeTab === 'found',
  })

  const isLoading = activeTab === 'lost' ? isLostLoading : isFoundLoading
  const isError = activeTab === 'lost' ? isLostError : isFoundError

  // Backend paginated items wrapper
  const lostItems: Item[] = (lostResponse?.data || []).map((bItem: any) => ({
    id: bItem.id,
    type: 'lost',
    title: bItem.title,
    category: bItem.category?.name || 'Uncategorized',
    date: bItem.lost_at || new Date().toISOString(),
    location: bItem.lost_location || 'Unknown',
    status: bItem.status,
    description: bItem.description || '',
    reportedBy: bItem.user?.name || 'Owner User',
    imageUrl: bItem.image_path ? `${import.meta.env.VITE_STORAGE_URL || '/storage'}/${bItem.image_path}` : undefined,
    contactPhone: bItem.contact_phone || undefined,
    userId: bItem.user?.id,
  }))

  const foundItems: Item[] = (foundResponse?.data || []).map((bItem: any) => ({
    id: bItem.id,
    type: 'found',
    title: bItem.title,
    category: bItem.category?.name || 'Uncategorized',
    date: bItem.found_at || new Date().toISOString(),
    location: bItem.found_location || 'Unknown',
    status: bItem.status,
    description: bItem.description || '',
    reportedBy: bItem.user?.name || 'Owner User',
    imageUrl: bItem.image_path ? `${import.meta.env.VITE_STORAGE_URL || '/storage'}/${bItem.image_path}` : undefined,
    contactPhone: bItem.contact_phone || undefined,
    userId: bItem.user?.id,
  }))

  const items = activeTab === 'lost' ? lostItems : foundItems

  return (
    <section className="space-y-6">
      {/* Header Visual Panel */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#003fb1]">
            <ShieldAlert className="h-4 w-4" />
            My Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#191b23]">My Reports</h1>
          <p className="mt-2 text-[#434654]">Manage the items you have reported lost or found. You can close items once they are recovered.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e1ed]">
        <button
          onClick={() => setActiveTab('lost')}
          className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition-all duration-200 ${
            activeTab === 'lost'
              ? 'border-[#003fb1] text-[#003fb1]'
              : 'border-transparent text-[#737686] hover:text-[#191b23]'
          }`}
        >
          My Lost Items
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition-all duration-200 ${
            activeTab === 'found'
              ? 'border-[#003fb1] text-[#003fb1]'
              : 'border-transparent text-[#737686] hover:text-[#191b23]'
          }`}
        >
          My Found Items
        </button>
      </div>

      {/* List content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-[#737686]">
          <Loader2 className="h-8 w-8 animate-spin text-[#003fb1]" />
          <p className="mt-2 text-sm font-medium">Fetching reports...</p>
        </div>
      ) : isError ? (
        <ErrorState description="Unable to load reports from the API." />
      ) : items.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : activeTab === 'lost' ? (
        <EmptyState
          title="No reports found"
          description="You haven't reported any lost items yet."
          actionLabel="Report lost item"
          actionTo="/lost-items/new"
        />
      ) : (
        <EmptyState
          title="No reports found"
          description="You haven't reported any found items yet."
          actionLabel="Report found item"
          actionTo="/found-items/new"
        />
      )}
    </section>
  )
}
