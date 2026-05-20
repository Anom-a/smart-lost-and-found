import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import toast from 'react-hot-toast'
import { ClaimsPage } from '../../ClaimsPage'

const apiMocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  approveClaim: vi.fn(),
  rejectClaim: vi.fn(),
  getApiErrorMessage: vi.fn((error: unknown) => (error instanceof Error ? error.message : 'Unable to update claim.')),
}))

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'User A', email: 'user@example.com', studentId: 'STU-001' },
  }),
}))

vi.mock('../../../lib/api', () => ({
  getClaims: apiMocks.getClaims,
  approveClaim: apiMocks.approveClaim,
  rejectClaim: apiMocks.rejectClaim,
  getApiErrorMessage: apiMocks.getApiErrorMessage,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastMocks.success,
    error: toastMocks.error,
  },
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
        <ClaimsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function createClaim(id: number, status: 'pending' | 'approved' | 'rejected' = 'pending') {
  return {
    id,
    status,
    proof_message: `Proof message for claim ${id}`,
    created_at: '2026-05-20T10:00:00.000Z',
    claimant: { id: 1, name: 'User A', student_id: 'STU-001' },
    lost_item: {
      id: id + 10,
      title: `Lost Item ${id}`,
      category: 'Electronics',
      location: 'Library',
      date_lost: '2026-05-18T10:00:00.000Z',
      status: 'open',
    },
    found_item: {
      id: id + 20,
      title: `Found Item ${id}`,
      category: 'Electronics',
      location: 'Stem Center',
      date_found: '2026-05-19T10:00:00.000Z',
      status: 'available',
      reporter: { id: 2, name: 'User B', student_id: 'STU-002' },
    },
  }
}

describe('ClaimsPage', () => {
  beforeEach(() => {
    apiMocks.getClaims.mockReset()
    apiMocks.approveClaim.mockReset()
    apiMocks.rejectClaim.mockReset()
    apiMocks.getApiErrorMessage.mockClear()
    toastMocks.success.mockClear()
    toastMocks.error.mockClear()
  })

  test('shows a loading skeleton while claims are being fetched', () => {
    apiMocks.getClaims.mockReturnValueOnce(new Promise(() => undefined))

    renderPage()

    expect(screen.getByText(/loading claims/i)).toBeInTheDocument()
    expect(screen.getAllByTestId('claim-skeleton')).toHaveLength(3)
  })

  test('renders two sections — Claims I Sent and Claims I Received', async () => {
    apiMocks.getClaims.mockResolvedValueOnce({ sent: [], received: [] })

    renderPage()

    expect(await screen.findByText(/claims i sent/i)).toBeInTheDocument()
    expect(screen.getByText(/claims i received/i)).toBeInTheDocument()
  })

  test('renders correct number of ClaimCards in each section', async () => {
    apiMocks.getClaims.mockResolvedValueOnce({
      sent: [createClaim(1), createClaim(2)],
      received: [createClaim(3), createClaim(4), createClaim(5)],
    })

    renderPage()

    expect(await screen.findByText(/claims i sent \[2\]/i)).toBeInTheDocument()
    expect(screen.getByText(/claims i received \[3\]/i)).toBeInTheDocument()
    expect(screen.getAllByText(/proof message for claim/i)).toHaveLength(5)
  })

  test('shows empty state in Claims I Sent when there are no sent claims', async () => {
    apiMocks.getClaims.mockResolvedValueOnce({ sent: [], received: [createClaim(1)] })

    renderPage()

    expect(await screen.findByText(/no sent claims yet/i)).toBeInTheDocument()
  })

  test('shows empty state in Claims I Received when there are no incoming claims', async () => {
    apiMocks.getClaims.mockResolvedValueOnce({ sent: [createClaim(1)], received: [] })

    renderPage()

    expect(await screen.findByText(/no received claims yet/i)).toBeInTheDocument()
  })

  test('calls the approve API endpoint when Approve is clicked on a received claim', async () => {
    const user = userEvent.setup()
    apiMocks.getClaims.mockResolvedValueOnce({ sent: [], received: [createClaim(1)] })
    apiMocks.approveClaim.mockResolvedValueOnce(createClaim(1, 'approved'))

    renderPage()

    await screen.findByRole('button', { name: /approve/i })
    await user.click(screen.getByRole('button', { name: /approve/i }))

    await waitFor(() => expect(apiMocks.approveClaim).toHaveBeenCalledWith(1))
  })

  test('calls the reject API endpoint when Reject is clicked on a received claim', async () => {
    const user = userEvent.setup()
    apiMocks.getClaims.mockResolvedValueOnce({ sent: [], received: [createClaim(1)] })
    apiMocks.rejectClaim.mockResolvedValueOnce(createClaim(1, 'rejected'))

    renderPage()

    await screen.findByRole('button', { name: /reject/i })
    await user.click(screen.getByRole('button', { name: /reject/i }))

    await waitFor(() => expect(apiMocks.rejectClaim).toHaveBeenCalledWith(1))
  })

  test('optimistically updates claim status in the UI before API response returns', async () => {
    const user = userEvent.setup()
    let resolveApprove: (value: unknown) => void = () => undefined

    apiMocks.getClaims.mockResolvedValueOnce({ sent: [], received: [createClaim(1)] })
    apiMocks.approveClaim.mockReturnValueOnce(new Promise((resolve) => {
      resolveApprove = resolve
    }))

    renderPage()

    await screen.findByRole('button', { name: /approve/i })
    await user.click(screen.getByRole('button', { name: /approve/i }))

    expect(screen.getByText('approved')).toBeInTheDocument()
    resolveApprove(createClaim(1, 'approved'))
  })

  test('reverts optimistic update and shows error toast if API call fails', async () => {
    const user = userEvent.setup()
    apiMocks.getClaims.mockResolvedValueOnce({ sent: [], received: [createClaim(1)] })
    apiMocks.approveClaim.mockRejectedValueOnce(new Error('Request failed'))

    renderPage()

    await screen.findByRole('button', { name: /approve/i })
    await user.click(screen.getByRole('button', { name: /approve/i }))

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalled()
    })
    expect(screen.getByText('pending')).toBeInTheDocument()
  })
})