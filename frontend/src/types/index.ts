export * from './models'

export type User = {
  id: number
  name: string
  student_id?: string | null
}

export type ClaimItemCategory = string | null

export type LostItem = {
  id: number
  title: string
  category: ClaimItemCategory
  location: string | null
  date_lost: string | null
  status: 'open' | 'available' | 'claimed' | 'closed' | string
}

export type FoundItem = {
  id: number
  title: string
  category: ClaimItemCategory
  location: string | null
  date_found: string | null
  status: 'open' | 'available' | 'claimed' | 'closed' | string
  reporter: User
}

export interface ClaimRequest {
  id: number
  status: 'pending' | 'approved' | 'rejected'
  proof_message: string
  created_at: string
  claimant: User
  lost_item: LostItem
  found_item: FoundItem
}

export interface ClaimsResponse {
  sent: ClaimRequest[]
  received: ClaimRequest[]
}