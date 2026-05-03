import { render, screen } from '@testing-library/react'
import { MatchCard } from './MatchCard'
import { matches } from '../lib/mockData'

test('MatchCard shows score percentage', () => {
  const match = matches[0]
  render(<MatchCard match={match} />)

  expect(screen.getByText(/82%/i)).toBeInTheDocument()
})
