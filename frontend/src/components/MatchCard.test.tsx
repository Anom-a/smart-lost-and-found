import { render, screen } from '@testing-library/react'
import { MatchCard } from './MatchCard'
import type { ItemMatch } from '../types/models'

test('MatchCard shows score percentage', () => {
  const match: ItemMatch = {
    id: 100,
    lostItemId: 2,
    foundItemId: 3,
    lostItemTitle: 'Blue Jansport Backpack',
    foundItemTitle: 'Student ID Card',
    score: 0.82,
    status: 'pending',
    createdAt: '2026-05-02T09:30:00.000Z',
  }

  render(<MatchCard match={match} />)

  expect(screen.getByText(/82%/i)).toBeInTheDocument()
})
