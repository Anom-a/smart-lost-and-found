import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemReportForm } from './ItemReportForm'

vi.mock('../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: 1, name: 'Electronics', slug: 'electronics', description: null }],
    isLoading: false,
  }),
}))

test('ItemReportForm shows validation errors', async () => {
  const onSubmit = vi.fn()
  render(<ItemReportForm onSubmit={onSubmit} />)

  const submit = screen.getByRole('button', { name: /submit report/i })
  await userEvent.click(submit)

  expect(await screen.findByText(/title is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/category is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/location is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/contact phone is required/i)).toBeInTheDocument()
})

test('ItemReportForm shows image preview after file selection', async () => {
  const onSubmit = vi.fn()
  render(<ItemReportForm onSubmit={onSubmit} />)

  const file = new File(['hello'], 'photo.png', { type: 'image/png' })
  const input = screen.getByLabelText(/item image/i) as HTMLInputElement

  await userEvent.upload(input, file)

  expect(await screen.findByAltText(/selected item preview/i)).toBeInTheDocument()
})

test('ItemReportForm submits selected image file', async () => {
  const onSubmit = vi.fn()
  const { container } = render(<ItemReportForm onSubmit={onSubmit} />)

  const titleInput = container.querySelector('input[name="title"]') as HTMLInputElement
  const categorySelect = container.querySelector('select[name="itemCategoryId"]') as HTMLSelectElement
  const locationInput = container.querySelector('input[name="location"]') as HTMLInputElement
  const contactPhoneInput = container.querySelector('input[name="contactPhone"]') as HTMLInputElement
  const descriptionInput = container.querySelector('textarea[name="description"]') as HTMLTextAreaElement

  await userEvent.type(titleInput, 'Lost headset')
  await userEvent.selectOptions(categorySelect, '1')
  await userEvent.type(locationInput, 'Library')
  await userEvent.type(contactPhoneInput, '+251912345678')
  await userEvent.type(descriptionInput, 'Black headset near the study area')

  const file = new File(['hello'], 'photo.png', { type: 'image/png' })
  await userEvent.upload(screen.getByLabelText(/item image/i), file)

  await userEvent.click(screen.getByRole('button', { name: /submit report/i }))

  expect(onSubmit).toHaveBeenCalled()
  expect(onSubmit.mock.calls[0][0].image).toBe(file)
  expect(onSubmit.mock.calls[0][0].contactPhone).toBe('+251912345678')
})
