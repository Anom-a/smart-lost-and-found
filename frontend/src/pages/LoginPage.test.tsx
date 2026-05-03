import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context'
import { LoginPage } from './LoginPage'

vi.mock('../lib/apiData', () => ({
  loginRequest: vi.fn(async (email: string) => ({
    token: 'real-api-token',
    user: { id: 1, name: email.split('@')[0], email },
  })),
  logoutRequest: vi.fn(),
  registerRequest: vi.fn(),
}))

test('LoginPage submits credentials', async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>,
  )

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
  await userEvent.type(screen.getByLabelText(/password/i), 'password')
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

  expect(screen.queryByText(/unable to sign in/i)).not.toBeInTheDocument()
})
