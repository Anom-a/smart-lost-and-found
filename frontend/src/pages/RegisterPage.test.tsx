import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context'
import { RegisterPage } from './RegisterPage'

vi.mock('../lib/apiData', () => ({
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
  registerRequest: vi.fn(),
}))

test('RegisterPage validates required fields', async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthProvider>,
  )

  await userEvent.click(screen.getByRole('button', { name: /create account/i }))

  expect(await screen.findByText(/name, email, student id, and password are required/i)).toBeInTheDocument()
})
