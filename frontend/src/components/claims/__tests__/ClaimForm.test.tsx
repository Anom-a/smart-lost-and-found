import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ClaimForm } from '../ClaimForm'

const apiMocks = vi.hoisted(() => ({
  submitClaim: vi.fn(),
  getApiErrorMessage: vi.fn(() => 'Unable to submit claim.'),
}))

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('../../../lib/api', () => ({
  submitClaim: apiMocks.submitClaim,
  getApiErrorMessage: apiMocks.getApiErrorMessage,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastMocks.success,
    error: toastMocks.error,
  },
}))

describe('ClaimForm', () => {
  const onSuccess = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    apiMocks.submitClaim.mockReset()
    apiMocks.getApiErrorMessage.mockClear()
    onSuccess.mockReset()
    onCancel.mockReset()
    toastMocks.success.mockClear()
    toastMocks.error.mockClear()
  })

  test('renders a textarea for proof_message and a Submit button', () => {
    render(<ClaimForm lostItemId={1} foundItemId={2} onSuccess={onSuccess} onCancel={onCancel} />)

    expect(screen.getByLabelText(/proof message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  test('shows validation error "Proof message is required" on empty submit', async () => {
    const user = userEvent.setup()

    render(<ClaimForm lostItemId={1} foundItemId={2} onSuccess={onSuccess} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/proof message is required/i)).toBeInTheDocument()
  })

  test('shows validation error when proof message is under 20 characters', async () => {
    const user = userEvent.setup()

    render(<ClaimForm lostItemId={1} foundItemId={2} onSuccess={onSuccess} onCancel={onCancel} />)

    await user.type(screen.getByLabelText(/proof message/i), 'too short')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/at least 20 characters/i)).toBeInTheDocument()
  })

  test('calls onSubmit prop with correct data when form is valid', async () => {
    const user = userEvent.setup()
    apiMocks.submitClaim.mockResolvedValueOnce({
      id: 7,
      status: 'pending',
      proof_message: 'This proof message is definitely long enough.',
      created_at: '2026-05-20T10:00:00.000Z',
      claimant: { id: 1, name: 'User A', student_id: 'STU-001' },
      lost_item: {
        id: 1,
        title: 'Lost Phone',
        category: 'Electronics',
        location: 'Library',
        date_lost: '2026-05-19T10:00:00.000Z',
        status: 'open',
      },
      found_item: {
        id: 2,
        title: 'Found Phone',
        category: 'Electronics',
        location: 'Stem Center',
        date_found: '2026-05-19T12:00:00.000Z',
        status: 'available',
        reporter: { id: 2, name: 'User B', student_id: 'STU-002' },
      },
    })

    render(<ClaimForm lostItemId={1} foundItemId={2} onSuccess={onSuccess} onCancel={onCancel} />)

    await user.type(screen.getByLabelText(/proof message/i), 'This proof message is definitely long enough.')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(apiMocks.submitClaim).toHaveBeenCalledWith({
        lost_item_id: 1,
        found_item_id: 2,
        proof_message: 'This proof message is definitely long enough.',
      })
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  test('disables the Submit button while submission is in progress', async () => {
    const user = userEvent.setup()
    let resolveClaim: (value: unknown) => void
    apiMocks.submitClaim.mockReturnValueOnce(new Promise((resolve) => {
      resolveClaim = resolve
    }))

    render(<ClaimForm lostItemId={1} foundItemId={2} onSuccess={onSuccess} onCancel={onCancel} />)

    await user.type(screen.getByLabelText(/proof message/i), 'This proof message is definitely long enough.')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()

    resolveClaim!({
      id: 7,
      status: 'pending',
      proof_message: 'This proof message is definitely long enough.',
      created_at: '2026-05-20T10:00:00.000Z',
      claimant: { id: 1, name: 'User A', student_id: 'STU-001' },
      lost_item: {
        id: 1,
        title: 'Lost Phone',
        category: 'Electronics',
        location: 'Library',
        date_lost: '2026-05-19T10:00:00.000Z',
        status: 'open',
      },
      found_item: {
        id: 2,
        title: 'Found Phone',
        category: 'Electronics',
        location: 'Stem Center',
        date_found: '2026-05-19T12:00:00.000Z',
        status: 'available',
        reporter: { id: 2, name: 'User B', student_id: 'STU-002' },
      },
    })
  })

  test('shows a success message after successful submission', async () => {
    const user = userEvent.setup()
    apiMocks.submitClaim.mockResolvedValueOnce({
      id: 8,
      status: 'pending',
      proof_message: 'This proof message is definitely long enough.',
      created_at: '2026-05-20T10:00:00.000Z',
      claimant: { id: 1, name: 'User A', student_id: 'STU-001' },
      lost_item: {
        id: 1,
        title: 'Lost Phone',
        category: 'Electronics',
        location: 'Library',
        date_lost: '2026-05-19T10:00:00.000Z',
        status: 'open',
      },
      found_item: {
        id: 2,
        title: 'Found Phone',
        category: 'Electronics',
        location: 'Stem Center',
        date_found: '2026-05-19T12:00:00.000Z',
        status: 'available',
        reporter: { id: 2, name: 'User B', student_id: 'STU-002' },
      },
    })

    render(<ClaimForm lostItemId={1} foundItemId={2} onSuccess={onSuccess} onCancel={onCancel} />)

    await user.type(screen.getByLabelText(/proof message/i), 'This proof message is definitely long enough.')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(toastMocks.success).toHaveBeenCalledWith('Claim submitted successfully.')
  })

  test('shows an error message when the API returns 409 (duplicate claim)', async () => {
    const user = userEvent.setup()
    const error = { response: { status: 409 } }
    apiMocks.submitClaim.mockRejectedValueOnce(error)

    render(<ClaimForm lostItemId={1} foundItemId={2} onSuccess={onSuccess} onCancel={onCancel} />)

    await user.type(screen.getByLabelText(/proof message/i), 'This proof message is definitely long enough.')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith('You have already submitted a claim for this item.')
    })
  })
})