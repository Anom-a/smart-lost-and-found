import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ItemCard } from '../components/ItemCard'
import { LoadingState } from '../components/LoadingState'
import { fetchLostItem } from '../lib/apiData'

export function LostItemDetailPage() {
  const { id } = useParams()
  const itemId = Number(id)
  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['lost-item', itemId],
    queryFn: () => fetchLostItem(itemId),
    enabled: Number.isFinite(itemId),
  })

  if (!Number.isFinite(itemId)) {
    return <EmptyState title="Lost item not found" description="The requested item could not be located." />
  }

  if (isLoading) return <LoadingState message="Loading lost item..." />
  if (isError) return <ErrorState title="Lost item not found" description="The requested item could not be loaded from the API." />

  if (!item) {
    return <EmptyState title="Lost item not found" description="The requested item could not be located." />
  }

  return <ItemCard item={item} />
}
