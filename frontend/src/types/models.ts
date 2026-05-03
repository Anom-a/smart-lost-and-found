export type ItemType = 'lost' | 'found'
export type ItemStatus = 'open' | 'matched' | 'claimed' | 'returned'

export type Item = {
  id: number
  type: ItemType
  title: string
  category: string
  date: string
  location: string
  status: ItemStatus
  description: string
  reportedBy: string
}

export type MatchStatus = 'pending' | 'reviewed' | 'confirmed'

export type ItemMatch = {
  id: number
  lostItemId: number
  foundItemId: number
  score: number
  status: MatchStatus
  createdAt: string
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected'

export type Claim = {
  id: number
  itemId: number
  itemType: ItemType
  claimant: string
  reason: string
  status: ClaimStatus
  submittedAt: string
}

export type AppNotification = {
  id: number
  type: 'match' | 'claim' | 'system'
  title: string
  message: string
  createdAt: string
  read: boolean
}

export type DashboardStats = {
  openLostItems: number
  openFoundItems: number
  activeMatches: number
  pendingClaims: number
}

export type AuthUser = {
  id: number
  name: string
  email: string
}
