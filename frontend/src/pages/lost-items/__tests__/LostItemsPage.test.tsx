import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { LostItemsPage } from '../../LostItemsPage'
import * as apiData from '../../../lib/apiData'

vi.mock('../../../lib/apiData', () => ({
  fetchLostItems: vi.fn(),
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
  }),
}))

let lastLocation: any = null

function LocationTracker() {
  const location = useLocation()
  lastLocation = location
  return null
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderPage(initialEntries = ['/lost-items']) {
  const client = createQueryClient()
  lastLocation = null

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/lost-items"
            element={
              <>
                <LostItemsPage />
                <LocationTracker />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('LostItemsPage Filters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('does not show closed items by default (no ?status filter)', async () => {
    vi.mocked(apiData.fetchLostItems).mockResolvedValue([])
    renderPage()
    await screen.findByRole('button', { name: /^open$/i })
    expect(apiData.fetchLostItems).toHaveBeenCalledWith('open')
  })

  test('shows only open items when "Open" filter is selected', async () => {
    vi.mocked(apiData.fetchLostItems).mockResolvedValue([])
    renderPage()
    const openBtn = await screen.findByRole('button', { name: /^open$/i })
    fireEvent.click(openBtn)
    await waitFor(() => {
      expect(apiData.fetchLostItems).toHaveBeenCalledWith('open')
    })
  })

  test('shows only closed items when "Closed" filter is selected', async () => {
    vi.mocked(apiData.fetchLostItems).mockResolvedValue([])
    renderPage()
    const closedBtn = await screen.findByRole('button', { name: /closed/i })
    fireEvent.click(closedBtn)
    await waitFor(() => {
      expect(apiData.fetchLostItems).toHaveBeenCalledWith('closed')
    })
  })

  test('shows all items when "All" filter is selected', async () => {
    vi.mocked(apiData.fetchLostItems).mockResolvedValue([])
    renderPage()
    const allBtn = await screen.findByRole('button', { name: /^all$/i })
    fireEvent.click(allBtn)
    await waitFor(() => {
      expect(apiData.fetchLostItems).toHaveBeenCalledWith('all')
    })
  })

  test('status filter buttons are rendered: "Open", "Closed", "All"', async () => {
    vi.mocked(apiData.fetchLostItems).mockResolvedValue([])
    renderPage()
    expect(await screen.findByRole('button', { name: /^open$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /closed/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
  })

  test('"Open" filter button is active/highlighted by default', async () => {
    vi.mocked(apiData.fetchLostItems).mockResolvedValue([])
    renderPage()
    const openBtn = await screen.findByRole('button', { name: /^open$/i })
    expect(openBtn).toHaveClass('bg-[#003fb1]')
  })

  test('selecting a filter updates the URL query param ?status=', async () => {
    vi.mocked(apiData.fetchLostItems).mockResolvedValue([])
    renderPage()
    const closedBtn = await screen.findByRole('button', { name: /closed/i })
    fireEvent.click(closedBtn)
    await waitFor(() => {
      expect(lastLocation?.search).toContain('status=closed')
    })
  })
})
