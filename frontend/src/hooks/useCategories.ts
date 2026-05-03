import { useQuery } from '@tanstack/react-query'
import { api, type ApiResponse } from '../lib/api'
import type { Category } from '../types/category'

async function fetchCategories() {
  const response = await api.get<ApiResponse<Category[]>>('/categories')

  return response.data.data
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}