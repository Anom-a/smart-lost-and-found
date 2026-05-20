import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { ClaimCard } from '../ClaimCard'
import type { ClaimRequest } from '../../../types'

function createClaim(status: ClaimRequest['status'] = 'pending'): ClaimRequest {
  return {
    id: 101,
    status,
    proof_message: 'I had this headset in my bag before it disappeared from the dorms.',
    created_at: '2026-05-20T10:00:00.000Z',
    claimant: {
      id: 1,
      name: 'User A',
      student_id: 'STU-001',
    },
    lost_item: {
      id: 11,
      title: 'Lost Headset',
      category: 'Electronics',
      location: 'Library',
      date_lost: '2026-05-18T10:00:00.000Z',
      status: 'open',
    },
    found_item: {
      id: 22,
      title: 'Found Headset',
      category: 'Electronics',
      location: 'Stem Center',
      date_found: '2026-05-19T10:00:00.000Z',
      status: 'available',
      reporter: {
        id: 2,
        name: 'User B',
        student_id: 'STU-002',
      },
    },
  }
}

describe('ClaimCard', () => {
  test('renders claimant name, proof message, and status badge', () => {
    render(<ClaimCard claim={createClaim()} currentUserId={2} />)

    expect(screen.getByText('User A')).toBeInTheDocument()
    expect(screen.getByText(/i had this headset/i)).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  test('shows Approve and Reject buttons when status is pending and current user is the found item reporter', () => {
    render(<ClaimCard claim={createClaim()} currentUserId={2} onApprove={vi.fn()} onReject={vi.fn()} />)

    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })

  test('does not show Approve or Reject buttons when current user is the claimant', () => {
    render(<ClaimCard claim={createClaim()} currentUserId={1} onApprove={vi.fn()} onReject={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument()
  })

  test('shows a Pending status badge styled in yellow', () => {
    render(<ClaimCard claim={createClaim('pending')} currentUserId={2} />)

    expect(screen.getByText('pending')).toHaveClass('bg-yellow-100')
  })

  test('shows an Approved status badge styled in green', () => {
    render(<ClaimCard claim={createClaim('approved')} currentUserId={2} />)

    expect(screen.getByText('approved')).toHaveClass('bg-[#dcfce7]')
  })

  test('shows a Rejected status badge styled in red', () => {
    render(<ClaimCard claim={createClaim('rejected')} currentUserId={2} />)

    expect(screen.getByText('rejected')).toHaveClass('bg-[#fee2e2]')
  })

  test('calls onApprove prop when Approve button is clicked', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()

    render(<ClaimCard claim={createClaim()} currentUserId={2} onApprove={onApprove} onReject={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /approve/i }))

    expect(onApprove).toHaveBeenCalledWith(101)
  })

  test('calls onReject prop when Reject button is clicked', async () => {
    const user = userEvent.setup()
    const onReject = vi.fn()

    render(<ClaimCard claim={createClaim()} currentUserId={2} onApprove={vi.fn()} onReject={onReject} />)

    await user.click(screen.getByRole('button', { name: /reject/i }))

    expect(onReject).toHaveBeenCalledWith(101)
  })
})