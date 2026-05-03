import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in')
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-emerald-700">Welcome back</p>
        <h1 className="text-3xl font-semibold text-slate-900">Login</h1>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
          <input id="email" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
          <input id="password" type="password" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white">Sign in</button>
      </form>
      <p className="text-sm text-slate-600">
        No account? <Link to="/register" className="font-medium text-emerald-700">Register</Link>
      </p>
    </div>
  )
}
