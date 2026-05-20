import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { MyItemsPage } from '../MyItemsPage'
import * as api from '../../lib/api'

vi.mock('../../lib/api', () => ({
  getMyLostItems: vi.fn(),
  getMyFoundItems: vi.fn(),
  closeLostItem: vi.fn(),
  closeFoundItem: vi.fn(),
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 2, name: 'Owner User' },
  }),
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderPage() {
  const client = createQueryClient()
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MyItemsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('MyItemsPage Tabs and Content', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders two tabs: "My Lost Items" and "My Found Items"', () => {
    vi.mocked(api.getMyLostItems).mockResolvedValue({ data: [], current_page: 1, per_page: 12, total: 0, last_page: 1 } as any)
    vi.mocked(api.getMyFoundItems).mockResolvedValue({ data: [], current_page: 1, per_page: 12, total: 0, last_page: 1 } as any)

    renderPage()

    expect(screen.getByRole('button', { name: /my lost items/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /my found items/i })).toBeInTheDocument()
  })

  test('"My Lost Items" tab is active by default', () => {
    vi.mocked(api.getMyLostItems).mockResolvedValue({ data: [], current_page: 1, per_page: 12, total: 0, last_page: 1 } as any)
    vi.mocked(api.getMyFoundItems).mockResolvedValue({ data: [], current_page: 1, per_page: 12, total: 0, last_page: 1 } as any)

    renderPage()

    const lostTab = screen.getByRole('button', { name: /my lost items/i })
    expect(lostTab).toHaveClass('border-[#003fb1]')
  })

  test('switching to "My Found Items" tab shows found items', async () => {
    vi.mocked(api.getMyLostItems).mockResolvedValue({ data: [], current_page: 1, per_page: 12, total: 0, last_page: 1 } as any)
    vi.mocked(api.getMyFoundItems).mockResolvedValue({
      data: [
        {
          id: 10,
          title: 'Found Keys',
          category: 'Keys',
          found_at: '2026-05-20T00:00:00.000Z',
          found_location: 'Hallway',
          status: 'available',
          description: 'Keys',
          user: { id: 2, name: 'Owner User' },
        },
      ],
      current_page: 1,
      per_page: 12,
      total: 1,
      last_page: 1,
    } as any)

    renderPage()

    const foundTab = screen.getByRole('button', { name: /my found items/i })
    fireEvent.click(foundTab)

    await waitFor(() => {
      expect(screen.getByText('Found Keys')).toBeInTheDocument()
    })
  })

  test('shows both open and closed items in each tab', async () => {
    vi.mocked(api.getMyLostItems).mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Lost Keys Open',
          category: 'Keys',
          lost_at: '2026-05-20T00:00:00.000Z',
          lost_location: 'Gym',
          status: 'open',
          description: 'Keys',
          user: { id: 2, name: 'Owner User' },
        },
        {
          id: 2,
          title: 'Lost Keys Closed',
          category: 'Keys',
          lost_at: '2026-05-20T00:00:00.000Z',
          lost_location: 'Gym',
          status: 'closed',
          description: 'Keys',
          user: { id: 2, name: 'Owner User' },
        },
      ],
      current_page: 1,
      per_page: 12,
      total: 2,
      last_page: 1,
    } as any)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Lost Keys Open')).toBeInTheDocument()
      expect(screen.getByText('Lost Keys Closed')).toBeInTheDocument()
    })
  })

  test('renders a CloseItemButton on each item card that is not already closed', async () => {
    vi.mocked(api.getMyLostItems).mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Lost Keys Open',
          category: 'Keys',
          lost_at: '2026-05-20T00:00:00.000Z',
          lost_location: 'Gym',
          status: 'open',
          description: 'Keys',
          user: { id: 2, name: 'Owner User' },
        },
      ],
      current_page: 1,
      per_page: 12,
      total: 1,
      last_page: 1,
    } as any)

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /close item/i })).toBeInTheDocument()
    })
  })

  test('does not render CloseItemButton on already closed item cards', async () => {
    vi.mocked(api.getMyLostItems).mockResolvedValue({
      data: [
        {
          id: 2,
          title: 'Lost Keys Closed',
          category: 'Keys',
          lost_at: '2026-05-20T00:00:00.000Z',
          lost_location: 'Gym',
          status: 'closed',
          description: 'Keys',
          user: { id: 2, name: 'Owner User' },
        },
      ],
      current_page: 1,
      per_page: 12,
      total: 1,
      last_page: 1,
    } as any)

    renderPage()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close item/i })).not.toBeInTheDocument()
    })
  })

  test('shows empty state when user has no lost items', async () => {
    vi.mocked(api.getMyLostItems).mockResolvedValue({ data: [], current_page: 1, per_page: 12, total: 0, last_page: 1 } as any)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/you haven't reported any lost items yet/i)).toBeInTheDocument()
    })
  })

  test('shows empty state when user has no found items', async () => {
    vi.mocked(api.getMyLostItems).mockResolvedValue({ data: [], current_page: 1, per_page: 12, total: 0, last_page: 1 } as any)
    vi.mocked(api.getMyFoundItems).mockResolvedValue({ data: [], current_page: 1, per_page: 12, total: 0, last_page: 1 } as any)

    renderPage()

    const foundTab = screen.getByRole('button', { name: /my found items/i })
    fireEvent.click(foundTab)

    await waitFor(() => {
      expect(screen.getByText(/you haven't reported any found items yet/i)).toBeInTheDocument()
    })
  })

  test('closing an item from the list updates its status chip to "Closed" immediately', async () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    
    vi.mocked(api.getMyLostItems)
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            title: 'Lost Keys Open',
            category: { name: 'Keys' },
            lost_at: '2026-05-20T00:00:00.000Z',
            lost_location: 'Gym',
            status: 'open',
            description: 'Keys',
            user: { id: 2, name: 'Owner User' },
          },
        ],
        current_page: 1,
        per_page: 12,
        total: 1,
        last_page: 1,
      } as any)
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            title: 'Lost Keys Open',
            category: { name: 'Keys' },
            lost_at: '2026-05-20T00:00:00.000Z',
            lost_location: 'Gym',
            status: 'closed',
            description: 'Keys',
            user: { id: 2, name: 'Owner User' },
          },
        ],
        current_page: 1,
        per_page: 12,
        total: 1,
        last_page: 1,
      } as any)

    vi.mocked(api.closeLostItem).mockResolvedValue({} as any)

    renderPage()

    await screen.findByRole('button', { name: /close item/i })
    fireEvent.click(screen.getByRole('button', { name: /close item/i }))

    await waitFor(() => {
      expect(screen.getByText(/closed/i)).toBeInTheDocument()
    })
  })
})
