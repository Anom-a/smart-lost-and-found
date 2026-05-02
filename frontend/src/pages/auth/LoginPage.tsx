import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import type { FormEvent } from 'react'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    login('demo-token', { id: 1, name: 'Demo User', email: 'demo@example.com' })
    navigate('/dashboard')
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <label>
          Email
          <input type="email" name="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" name="password" />
        </label>
        <Button type="submit">Login</Button>
        <p>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  )
}
