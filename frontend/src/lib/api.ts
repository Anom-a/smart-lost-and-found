import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import type { ClaimRequest, ClaimsResponse } from '../types'

export const API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '/api'
export const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? '/storage'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')

      if (window.location.pathname !== '/login') {
        toast.error('Your session expired. Please sign in again.')
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

type ValidationErrors = Record<string, string[]>

export function getApiErrorMessage(error: unknown, fallback = 'Request failed') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: ValidationErrors } | undefined
    const firstValidationMessage = data?.errors ? Object.values(data.errors).flat()[0] : undefined

    return firstValidationMessage ?? data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

type BackendClaimRequest = {
  id: number
  status: ClaimRequest['status']
  proof_message: string
  created_at: string
  claimant: {
    id: number
    name: string
    student_id?: string | null
  }
  lost_item: {
    id: number
    title: string
    category: string | null
    location: string | null
    date_lost: string | null
    status: string
  }
  found_item: {
    id: number
    title: string
    category: string | null
    location: string | null
    date_found: string | null
    status: string
    reporter: {
      id: number
      name: string
      student_id?: string | null
    } | null
  }
}

function toClaimRequest(claim: BackendClaimRequest): ClaimRequest {
  return {
    id: claim.id,
    status: claim.status,
    proof_message: claim.proof_message,
    created_at: claim.created_at,
    claimant: claim.claimant,
    lost_item: claim.lost_item,
    found_item: {
      ...claim.found_item,
      reporter: claim.found_item.reporter ?? { id: 0, name: 'Unknown', student_id: null },
    },
  }
}

export async function getClaims(): Promise<ClaimsResponse> {
  try {
    const response = await api.get<{ sent: BackendClaimRequest[]; received: BackendClaimRequest[] }>('/claims')

    return {
      sent: response.data.sent.map(toClaimRequest),
      received: response.data.received.map(toClaimRequest),
    }
  } catch (err) {
    // If the user is not authenticated return empty lists so the UI can
    // render an empty state instead of crashing or showing a blank page.
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return { sent: [], received: [] }
    }

    throw err
  }
}

export async function submitClaim(data: { lost_item_id: number; found_item_id: number; proof_message: string }): Promise<ClaimRequest> {
  const response = await api.post<BackendClaimRequest>('/claims', data)

  return toClaimRequest(response.data)
}

export async function approveClaim(id: number): Promise<ClaimRequest> {
  const response = await api.patch<BackendClaimRequest>(`/claims/${id}/approve`)

  return toClaimRequest(response.data)
}

export async function rejectClaim(id: number): Promise<ClaimRequest> {
  const response = await api.patch<BackendClaimRequest>(`/claims/${id}/reject`)

  return toClaimRequest(response.data)
}
