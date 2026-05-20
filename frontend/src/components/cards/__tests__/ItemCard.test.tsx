import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, test, vi } from 'vitest'
import { ItemCard } from '../../ItemCard'
import type { Item } from '../../../types/models'

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 2, name: 'Owner User' },
  }),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function renderCard(item: Item) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ItemCard item={item} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ItemCard Close Features', () => {
  test('renders CloseItemButton when the current user is the item owner', () => {
    const item: Item = {
      id: 1,
      type: 'lost',
      title: 'Keys',
      category: 'Keys',
      date: '2026-05-20T00:00:00.000Z',
      location: 'Gym',
      status: 'open',
      description: 'Keychain with car key',
      reportedBy: 'Owner User',
    }

    renderCard(item)

    expect(screen.getByRole('button', { name: /close item/i })).toBeInTheDocument()
  })

  test('does not render CloseItemButton when the current user is not the owner', () => {
    const item: Item = {
      id: 1,
      type: 'lost',
      title: 'Keys',
      category: 'Keys',
      date: '2026-05-20T00:00:00.000Z',
      location: 'Gym',
      status: 'open',
      description: 'Keychain with car key',
      reportedBy: 'Other User',
    }

    renderCard(item)

    expect(screen.queryByRole('button', { name: /close item/i })).not.toBeInTheDocument()
  })

  test('does not render CloseItemButton when item status is "closed"', () => {
    const item: Item = {
      id: 1,
      type: 'lost',
      title: 'Keys',
      category: 'Keys',
      date: '2026-05-20T00:00:00.000Z',
      location: 'Gym',
      status: 'closed',
      description: 'Keychain with car key',
      reportedBy: 'Owner User',
    }

    renderCard(item)

    expect(screen.queryByRole('button', { name: /close item/i })).not.toBeInTheDocument()
  })

  test('renders a "Closed" status chip when item status is "closed"', () => {
    const item: Item = {
      id: 1,
      type: 'lost',
      title: 'Keys',
      category: 'Keys',
      date: '2026-05-20T00:00:00.000Z',
      location: 'Gym',
      status: 'closed',
      description: 'Keychain with car key',
      reportedBy: 'Owner User',
    }

    renderCard(item)

    expect(screen.getByText(/closed/i)).toBeInTheDocument()
  })

  test('"Closed" status chip is visually distinct (check for a specific CSS class or aria-label indicating closed state)', () => {
    const item: Item = {
      id: 1,
      type: 'lost',
      title: 'Keys',
      category: 'Keys',
      date: '2026-05-20T00:00:00.000Z',
      location: 'Gym',
      status: 'closed',
      description: 'Keychain with car key',
      reportedBy: 'Owner User',
    }

    renderCard(item)

    const chip = screen.getByText(/closed/i)
    expect(chip).toHaveClass('bg-gray-100')
  })
})
