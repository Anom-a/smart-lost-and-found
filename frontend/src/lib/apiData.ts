import { api, STORAGE_URL, getClaims, type ApiResponse } from './api'
import type { AppNotification, AuthUser, Claim, Item, ItemMatch } from '../types/models'
import type { ClaimRequest } from '../types'

type BackendUser = {
  id: number
  name: string
  email: string
  student_id?: string
}

type BackendCategory = {
  id: number
  name: string
  slug: string
}

type BackendLostItem = {
  id: number
  title: string
  description: string
  lost_location: string | null
  lost_at: string | null
  status: Item['status']
  created_at: string | null
  updated_at: string | null
  image_path: string | null
  contact_phone: string | null
  user?: BackendUser
  category?: BackendCategory
}

type BackendFoundItem = {
  id: number
  title: string
  description: string
  found_location: string | null
  found_at: string | null
  status: Item['status']
  match_score?: number
  created_at: string | null
  updated_at: string | null
  image_path: string | null
  contact_phone: string | null
  user?: BackendUser
  category?: BackendCategory
}

type BackendClaim = {
  id: number
  status: Claim['status']
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

type LegacyBackendClaim = {
  id: number
  found_item_id: number
  message: string | null
  proof_details: Record<string, unknown> | null
  status: Claim['status']
  created_at: string
  claimant?: BackendUser
}

type BackendNotification = {
  id: number
  type: string
  title: string
  message: string
  read_at: string | null
  created_at: string
  data?: Record<string, any> | null
}

type AuthResponse = {
  user: BackendUser
  token: string
}

export type RegisterPayload = {
  name: string
  email: string
  studentId: string
  password: string
}

export type ReportPayload = {
  title: string
  itemCategoryId: number
  date?: string
  location: string
  description: string
  contactPhone: string
  image?: File
}

function toStorageUrl(path: string | null | undefined): string | undefined {
  if (!path) {
    return undefined
  }

  return `${STORAGE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function toItemFormData(payload: ReportPayload, type: 'lost' | 'found'): FormData {
  const formData = new FormData()

  formData.append('item_category_id', String(payload.itemCategoryId))
  formData.append('title', payload.title)
  formData.append('description', payload.description)
  formData.append('contact_phone', payload.contactPhone)

  if (type === 'lost') {
    formData.append('lost_location', payload.location)
    if (payload.date) {
      formData.append('lost_at', payload.date)
    }
  }

  if (type === 'found') {
    formData.append('found_location', payload.location)
    if (payload.date) {
      formData.append('found_at', payload.date)
    }
  }

  if (payload.image) {
    formData.append('image', payload.image)
  }

  return formData
}

export function toAuthUser(user: BackendUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    studentId: user.student_id,
  }
}

function toLostItem(item: BackendLostItem): Item {
  return {
    id: item.id,
    type: 'lost',
    title: item.title,
    category: item.category?.name ?? 'Uncategorized',
    date: item.lost_at ?? item.created_at ?? new Date().toISOString(),
    location: item.lost_location ?? 'Not specified',
    status: item.status,
    description: item.description,
    reportedBy: item.user?.name ?? 'Unknown',
    imageUrl: toStorageUrl(item.image_path),
    contactPhone: item.contact_phone ?? undefined,
  }
}

function toFoundItem(item: BackendFoundItem): Item {
  return {
    id: item.id,
    type: 'found',
    title: item.title,
    category: item.category?.name ?? 'Uncategorized',
    date: item.found_at ?? item.created_at ?? new Date().toISOString(),
    location: item.found_location ?? 'Not specified',
    status: item.status,
    description: item.description,
    reportedBy: item.user?.name ?? 'Unknown',
    imageUrl: toStorageUrl(item.image_path),
    contactPhone: item.contact_phone ?? undefined,
  }
}

function toClaim(claim: LegacyBackendClaim | ClaimRequest): Claim {
  if ('proof_message' in claim) {
    return {
      id: claim.id,
      itemId: claim.found_item.id,
      itemType: 'found',
      claimant: claim.claimant.name,
      reason: claim.proof_message,
      status: claim.status,
      submittedAt: claim.created_at,
    }
  }

  return {
    id: claim.id,
    itemId: claim.found_item_id,
    itemType: 'found',
    claimant: claim.claimant?.name ?? 'Unknown claimant',
    reason: claim.message ?? JSON.stringify(claim.proof_details ?? {}),
    status: claim.status,
    submittedAt: claim.created_at,
  }
}

function toNotification(notification: BackendNotification): AppNotification {
  return {
    id: notification.id,
    type: notification.type.includes('claim') ? 'claim' : notification.type.includes('match') ? 'match' : 'system',
    title: notification.title,
    message: notification.message,
    createdAt: notification.created_at,
    read: Boolean(notification.read_at),
    data: notification.data ?? undefined,
  }
}

export async function loginRequest(email: string, password: string) {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password })

  return {
    user: toAuthUser(response.data.data.user),
    token: response.data.data.token,
  }
}

export async function registerRequest(payload: RegisterPayload) {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
    name: payload.name,
    email: payload.email,
    student_id: payload.studentId,
    password: payload.password,
    password_confirmation: payload.password,
  })

  return {
    user: toAuthUser(response.data.data.user),
    token: response.data.data.token,
  }
}

export async function logoutRequest() {
  await api.post('/auth/logout')
}

export async function fetchLostItems() {
  const response = await api.get<ApiResponse<BackendLostItem[]>>('/lost-items', { params: { per_page: 50 } })

  return response.data.data.map(toLostItem)
}

export async function fetchFoundItems() {
  const response = await api.get<ApiResponse<BackendFoundItem[]>>('/found-items', { params: { per_page: 50 } })

  return response.data.data.map(toFoundItem)
}

export async function fetchLostItem(id: number) {
  const response = await api.get<ApiResponse<BackendLostItem>>(`/lost-items/${id}`)

  return toLostItem(response.data.data)
}

export async function fetchFoundItem(id: number) {
  const response = await api.get<ApiResponse<BackendFoundItem>>(`/found-items/${id}`)

  return toFoundItem(response.data.data)
}

export async function fetchClaims() {
  const response = await getClaims()
  const combined = [...response.sent, ...response.received]
  const seen = new Set<number>()

  return combined.filter((claim) => {
    if (seen.has(claim.id)) {
      return false
    }

    seen.add(claim.id)
    return true
  }).map(toClaim)
}

type BackendMatchFoundItem = {
  id: number
  title: string
  found_location: string | null
  found_at: string | null
  status: Item['status']
  match_score?: number
  created_at: string | null
  updated_at: string | null
  user?: BackendUser
  category?: BackendCategory
}

export async function fetchLostItemMatches(lostItemId: number) {
  const response = await api.get<ApiResponse<BackendMatchFoundItem[]>>(`/lost-items/${lostItemId}/matches`)

  return response.data.data.map((foundItem): ItemMatch => ({
    id: Number(`${lostItemId}${foundItem.id}`),
    lostItemId,
    foundItemId: foundItem.id,
    lostItemTitle: `Lost item #${lostItemId}`,
    foundItemTitle: foundItem.title,
    score: foundItem.match_score ?? 0,
    status: 'pending',
    createdAt: foundItem.updated_at ?? foundItem.created_at ?? new Date().toISOString(),
    foundItemReporter: foundItem.user
      ? {
          id: foundItem.user.id,
          name: foundItem.user.name,
          email: foundItem.user.email,
          studentId: foundItem.user.student_id,
        }
      : undefined,
  }))
}

export async function fetchNotifications() {
  const response = await api.get<ApiResponse<BackendNotification[]>>('/notifications', { params: { per_page: 50 } })

  return response.data.data.map(toNotification)
}

export async function markAllNotificationsAsRead() {
  await api.post('/notifications/mark-all-read')
}

export async function fetchMatches() {
  const lostItems = await fetchLostItems()
  const responses = await Promise.all(
    lostItems.map(async (lostItem) => {
      const response = await api.get<ApiResponse<BackendFoundItem[]>>(`/lost-items/${lostItem.id}/matches`)

      return response.data.data.map((foundItem): ItemMatch => ({
        id: Number(`${lostItem.id}${foundItem.id}`),
        lostItemId: lostItem.id,
        foundItemId: foundItem.id,
        lostItemTitle: lostItem.title,
        foundItemTitle: foundItem.title,
        score: foundItem.match_score ?? 0,
        status: 'pending',
        createdAt: foundItem.updated_at ?? foundItem.created_at ?? new Date().toISOString(),
      }))
    }),
  )

  return responses.flat()
}

export async function createLostItem(payload: ReportPayload) {
  const response = await api.post<ApiResponse<BackendLostItem>>('/lost-items', toItemFormData(payload, 'lost'), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return toLostItem(response.data.data)
}

export async function createFoundItem(payload: ReportPayload) {
  const response = await api.post<ApiResponse<BackendFoundItem>>('/found-items', toItemFormData(payload, 'found'), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return toFoundItem(response.data.data)
}
