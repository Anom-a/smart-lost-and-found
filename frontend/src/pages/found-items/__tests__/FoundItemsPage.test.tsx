import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { FoundItemsPage } from '../../FoundItemsPage'
import * as apiData from '../../../lib/apiData'

vi.mock('../../../lib/apiData', () => ({
  fetchFoundItems: vi.fn(),
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

function renderPage(initialEntries = ['/found-items']) {
  const client = createQueryClient()
  lastLocation = null

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/found-items"
            element={
              <>
                <FoundItemsPage />
                <LocationTracker />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('FoundItemsPage Filters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('does not show closed items by default', async () => {
    vi.mocked(apiData.fetchFoundItems).mockResolvedValue([])
    renderPage()
    await screen.findByRole('button', { name: /available/i })
    expect(apiData.fetchFoundItems).toHaveBeenCalledWith('available')
  })

  test('shows only available items when "Available" filter is selected', async () => {
    vi.mocked(apiData.fetchFoundItems).mockResolvedValue([])
    renderPage()
    const availBtn = await screen.findByRole('button', { name: /available/i })
    fireEvent.click(availBtn)
    await waitFor(() => {
      expect(apiData.fetchFoundItems).toHaveBeenCalledWith('available')
    })
  })

  test('shows only closed items when "Closed" filter is selected', async () => {
    vi.mocked(apiData.fetchFoundItems).mockResolvedValue([])
    renderPage()
    const closedBtn = await screen.findByRole('button', { name: /closed/i })
    fireEvent.click(closedBtn)
    await waitFor(() => {
      expect(apiData.fetchFoundItems).toHaveBeenCalledWith('closed')
    })
  })

  test('shows all items when "All" filter is selected', async () => {
    vi.mocked(apiData.fetchFoundItems).mockResolvedValue([])
    renderPage()
    const allBtn = await screen.findByRole('button', { name: /^all$/i })
    fireEvent.click(allBtn)
    await waitFor(() => {
      expect(apiData.fetchFoundItems).toHaveBeenCalledWith('all')
    })
  })

  test('filter buttons rendered: "Available", "Closed", "All"', async () => {
    vi.mocked(apiData.fetchFoundItems).mockResolvedValue([])
    renderPage()
    expect(await screen.findByRole('button', { name: /available/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /closed/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
  })

  test('"Available" filter is active by default', async () => {
    vi.mocked(apiData.fetchFoundItems).mockResolvedValue([])
    renderPage()
    const availBtn = await screen.findByRole('button', { name: /available/i })
    expect(availBtn).toHaveClass('bg-[#003fb1]')
  })

  test('selecting a filter updates the URL query param ?status=', async () => {
    vi.mocked(apiData.fetchFoundItems).mockResolvedValue([])
    renderPage()
    const closedBtn = await screen.findByRole('button', { name: /closed/i })
    fireEvent.click(closedBtn)
    await waitFor(() => {
      expect(lastLocation?.search).toContain('status=closed')
    })
  })
})
