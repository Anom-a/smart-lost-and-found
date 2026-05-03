import type { AppNotification, Claim, DashboardStats, Item, ItemMatch } from '../types/models'

export const items: Item[] = [
  {
    id: 1,
    type: 'lost',
    title: 'Dell XPS 13 Laptop',
    category: 'Electronics',
    date: '2026-04-28',
    location: 'Engineering Block - Lab 2',
    status: 'open',
    description: 'Silver 13-inch laptop with university sticker on the lid.',
    reportedBy: 'Amina Yusuf',
  },
  {
    id: 2,
    type: 'lost',
    title: 'Blue Jansport Backpack',
    category: 'Bags',
    date: '2026-04-30',
    location: 'Library Reading Hall',
    status: 'matched',
    description: 'Contains notebooks and a black calculator in the front pocket.',
    reportedBy: 'David Kariuki',
  },
  {
    id: 3,
    type: 'found',
    title: 'Student ID Card',
    category: 'Documents',
    date: '2026-05-01',
    location: 'Main Cafeteria',
    status: 'open',
    description: 'ID card found near the drinks counter.',
    reportedBy: 'Campus Security',
  },
  {
    id: 4,
    type: 'found',
    title: 'Wireless Earbuds Case',
    category: 'Electronics',
    date: '2026-05-02',
    location: 'Business School Parking Lot',
    status: 'claimed',
    description: 'Matte black charging case with no earbuds inside.',
    reportedBy: 'John Mwangi',
  },
]

export const matches: ItemMatch[] = [
  {
    id: 100,
    lostItemId: 2,
    foundItemId: 3,
    score: 0.82,
    status: 'pending',
    createdAt: '2026-05-02T09:30:00.000Z',
  },
  {
    id: 101,
    lostItemId: 1,
    foundItemId: 4,
    score: 0.64,
    status: 'reviewed',
    createdAt: '2026-05-02T12:45:00.000Z',
  },
]

export const claims: Claim[] = [
  {
    id: 500,
    itemId: 4,
    itemType: 'found',
    claimant: 'Grace Wanjiku',
    reason: 'The case has a scratched letter G at the bottom.',
    status: 'pending',
    submittedAt: '2026-05-02T15:05:00.000Z',
  },
  {
    id: 501,
    itemId: 3,
    itemType: 'found',
    claimant: 'Paul Ochieng',
    reason: 'Card has my registration number and faculty details.',
    status: 'approved',
    submittedAt: '2026-05-01T11:10:00.000Z',
  },
]

export const notifications: AppNotification[] = [
  {
    id: 900,
    type: 'match',
    title: 'New match detected',
    message: 'A backpack report has an 82% similarity score.',
    createdAt: '2026-05-02T10:00:00.000Z',
    read: false,
  },
  {
    id: 901,
    type: 'claim',
    title: 'Claim pending review',
    message: 'A claim was filed for Wireless Earbuds Case.',
    createdAt: '2026-05-02T15:07:00.000Z',
    read: false,
  },
  {
    id: 902,
    type: 'system',
    title: 'System notice',
    message: 'Remember to provide clear item descriptions for faster matching.',
    createdAt: '2026-05-01T08:00:00.000Z',
    read: true,
  },
]

export function getItemById(id: number, type: 'lost' | 'found') {
  return items.find((item) => item.id === id && item.type === type)
}

export function getItemTitle(itemId: number) {
  return items.find((item) => item.id === itemId)?.title ?? `Item #${itemId}`
}

export function getDashboardStats(): DashboardStats {
  return {
    openLostItems: items.filter((item) => item.type === 'lost' && item.status === 'open').length,
    openFoundItems: items.filter((item) => item.type === 'found' && item.status === 'open').length,
    activeMatches: matches.filter((match) => match.status !== 'confirmed').length,
    pendingClaims: claims.filter((claim) => claim.status === 'pending').length,
  }
}
