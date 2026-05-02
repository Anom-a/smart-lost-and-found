import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export function RegisterPage() {
  return (
    <main className="auth-page">
      <form className="auth-card">
        <h1>Create account</h1>
        <label>
          Full name
          <input type="text" name="name" placeholder="Your name" />
        </label>
        <label>
          Email
          <input type="email" name="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" name="password" />
        </label>
        <Button type="submit">Register</Button>
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  )
}
