import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ItemCard } from '../components/ItemCard'
import { LoadingState } from '../components/LoadingState'
import { fetchFoundItem } from '../lib/apiData'

export function FoundItemDetailPage() {
  const { id } = useParams()
  const itemId = Number(id)
  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['found-item', itemId],
    queryFn: () => fetchFoundItem(itemId),
    enabled: Number.isFinite(itemId),
  })

  if (!Number.isFinite(itemId)) {
    return <EmptyState title="Found item not found" description="The requested item could not be located." />
  }

  if (isLoading) return <LoadingState message="Loading found item..." />
  if (isError) return <ErrorState title="Found item not found" description="The requested item could not be loaded from the API." />

  if (!item) {
    return <EmptyState title="Found item not found" description="The requested item could not be located." />
  }

  return <ItemCard item={item} />
}
