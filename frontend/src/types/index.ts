export type ItemStatus = 'open' | 'matched' | 'claimed' | 'closed'

export interface User {
  id: number
  name: string
  email: string
}

export interface BaseItem {
  id: number
  title: string
  category: string
  description: string
  location: string
  imageUrl?: string
  status: ItemStatus
  createdAt: string
}

export interface LostItem extends BaseItem {
  lostDate: string
}

export interface FoundItem extends BaseItem {
  foundDate: string
}

export interface Match {
  id: number
  lostItem: LostItem
  foundItem: FoundItem
  confidence: number
  createdAt: string
}

export interface Claim {
  id: number
  itemTitle: string
  requesterName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Notification {
  id: number
  title: string
  message: string
  read: boolean
  createdAt: string
}
