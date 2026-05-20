import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { CloseItemButton } from '../CloseItemButton'
import toast from 'react-hot-toast'
import * as api from '../../../lib/api'

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../../lib/api', () => ({
  closeLostItem: vi.fn(),
  closeFoundItem: vi.fn(),
}))

describe('CloseItemButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders a "Close Item" button', () => {
    render(
      <CloseItemButton
        itemId={1}
        itemType="lost"
        currentUserId={2}
        ownerId={2}
        status="open"
        onSuccess={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /close item/i })).toBeInTheDocument()
  })

  test('does not render when the current user is not the item owner', () => {
    const { container } = render(
      <CloseItemButton
        itemId={1}
        itemType="lost"
        currentUserId={2}
        ownerId={3}
        status="open"
        onSuccess={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  test('shows a confirmation dialog when clicked', () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => false)
    render(
      <CloseItemButton
        itemId={1}
        itemType="lost"
        currentUserId={2}
        ownerId={2}
        status="open"
        onSuccess={vi.fn()}
      />
    )
    const button = screen.getByRole('button', { name: /close item/i })
    fireEvent.click(button)
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to close this item? This cannot be undone.'
    )
  })

  test('calls the close API function when the user confirms in the dialog', async () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    const mockClose = vi.mocked(api.closeLostItem).mockResolvedValue({} as any)
    const onSuccess = vi.fn()

    render(
      <CloseItemButton
        itemId={1}
        itemType="lost"
        currentUserId={2}
        ownerId={2}
        status="open"
        onSuccess={onSuccess}
      />
    )
    const button = screen.getByRole('button', { name: /close item/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalledWith(1)
      expect(onSuccess).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Item closed successfully')
    })
  })

  test('does not call the API when the user cancels the dialog', () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => false)
    const mockClose = vi.mocked(api.closeLostItem)

    render(
      <CloseItemButton
        itemId={1}
        itemType="lost"
        currentUserId={2}
        ownerId={2}
        status="open"
        onSuccess={vi.fn()}
      />
    )
    const button = screen.getByRole('button', { name: /close item/i })
    fireEvent.click(button)

    expect(mockClose).not.toHaveBeenCalled()
  })

  test('shows a loading state on the button while the API call is in progress', async () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    let resolvePromise: (val: any) => void = () => {}
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    vi.mocked(api.closeLostItem).mockReturnValue(promise)

    render(
      <CloseItemButton
        itemId={1}
        itemType="lost"
        currentUserId={2}
        ownerId={2}
        status="open"
        onSuccess={vi.fn()}
      />
    )
    const button = screen.getByRole('button', { name: /close item/i })
    fireEvent.click(button)

    expect(screen.getByRole('button', { name: /closing.../i })).toBeInTheDocument()
    resolvePromise({} as any)
  })

  test('shows an error toast if the API call fails', async () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    vi.mocked(api.closeLostItem).mockRejectedValue(new Error('Failed to close'))

    render(
      <CloseItemButton
        itemId={1}
        itemType="lost"
        currentUserId={2}
        ownerId={2}
        status="open"
        onSuccess={vi.fn()}
      />
    )
    const button = screen.getByRole('button', { name: /close item/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to close item. Please try again.')
    })
  })

  test('button is not rendered when item status is already "closed"', () => {
    const { container } = render(
      <CloseItemButton
        itemId={1}
        itemType="lost"
        currentUserId={2}
        ownerId={2}
        status="closed"
        onSuccess={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
