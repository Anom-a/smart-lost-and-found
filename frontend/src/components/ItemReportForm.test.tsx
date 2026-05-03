import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemReportForm } from './ItemReportForm'

vi.mock('../hooks/useCategories', () => ({
  useCategories: () => ({ data: [], isLoading: false }),
}))

test('ItemReportForm shows validation errors', async () => {
  const onSubmit = vi.fn()
  render(<ItemReportForm onSubmit={onSubmit} />)

  const submit = screen.getByRole('button', { name: /submit report/i })
  await userEvent.click(submit)

  expect(await screen.findByText(/title is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/category is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/location is required/i)).toBeInTheDocument()
})
