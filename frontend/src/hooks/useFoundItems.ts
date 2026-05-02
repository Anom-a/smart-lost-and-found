import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { FoundItem } from '../types'

export function useFoundItems() {
  const [items, setItems] = useState<FoundItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    api
      .get<FoundItem[]>('/found-items')
      .then((response) => {
        if (isMounted) {
          setItems(response.data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load found items.')
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
