import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context'
import { RegisterPage } from './RegisterPage'

test('RegisterPage validates required fields', async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthProvider>,
  )

  await userEvent.click(screen.getByRole('button', { name: /create account/i }))

  // The page uses simple client-side checks inside the register function which throw errors when missing
  expect(await screen.findByText(/name, email, and password are required/i)).toBeInTheDocument()
})
