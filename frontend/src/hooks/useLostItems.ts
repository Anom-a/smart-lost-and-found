import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { LostItem } from '../types'

export function useLostItems() {
  const [items, setItems] = useState<LostItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    api
      .get<LostItem[]>('/lost-items')
      .then((response) => {
        if (isMounted) {
          setItems(response.data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load lost items.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { items, isLoading, error }
}
