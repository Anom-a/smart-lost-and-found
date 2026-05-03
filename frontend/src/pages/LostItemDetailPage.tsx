import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ItemCard } from '../components/ItemCard'
import { getItemById } from '../lib/mockData'

export function LostItemDetailPage() {
  const { id } = useParams()
  const item = id ? getItemById(Number(id), 'lost') : undefined

  if (!item) {
    return <EmptyState title="Lost item not found" description="The requested item could not be located." />
  }

  return <ItemCard item={item} />
}
