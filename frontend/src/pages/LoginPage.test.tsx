import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context'
import { LoginPage } from './LoginPage'

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

  // After login the AuthProvider stores a mock token and user; ensure no error shown
  expect(screen.queryByText(/unable to sign in/i)).not.toBeInTheDocument()
})
