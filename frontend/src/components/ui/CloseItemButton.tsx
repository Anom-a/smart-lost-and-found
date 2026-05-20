import { useState } from 'react'
import toast from 'react-hot-toast'
import { closeLostItem, closeFoundItem } from '../../lib/api'

interface CloseItemButtonProps {
  itemId: number
  itemType: 'lost' | 'found'
  currentUserId: number | undefined
  ownerId: number
  status: string
  onSuccess: () => void
}

export function CloseItemButton({
  itemId,
  itemType,
  currentUserId,
  ownerId,
  status,
  onSuccess,
}: CloseItemButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (currentUserId !== ownerId || status === 'closed') {
    return null
  }

  const handleClose = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to close this item? This cannot be undone.'
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      if (itemType === 'lost') {
        await closeLostItem(itemId)
      } else {
        await closeFoundItem(itemId)
      }
      toast.success('Item closed successfully')
      onSuccess()
    } catch (error) {
      toast.error('Failed to close item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClose}
      disabled={isLoading}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 focus:outline-none transition-colors"
    >
      {isLoading ? 'Closing...' : 'Close Item'}
    </button>
  )
}
