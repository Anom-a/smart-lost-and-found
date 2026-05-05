import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, IdCard, Loader2, LockKeyhole, Mail, ShieldAlert, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthVisualPanel } from '../components/AuthVisualPanel'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register({ name, email, studentId, password })
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to register')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[#faf8ff] text-[#191b23] lg:grid-cols-[0.96fr_1.04fr]">
      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-16">
        <Link to="/" className="w-fit text-xl font-bold tracking-tight text-[#003fb1]">
          FoundTrust
        </Link>

        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-xl py-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#003fb1]">Create account</p>
              <h1 className="mt-4 text-4xl font-bold leading-[44px] tracking-[-0.02em] text-[#191b23]">
                Start safely
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-7 text-[#434654]">
                Create your FoundTrust profile to report items, receive matches, and complete verified recoveries.
              </p>
            </div>

            <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-[#191b23]" htmlFor="name">
                  Full name
                </label>
                <div className="mt-2 flex h-14 items-center gap-3 rounded-md border border-[#c3c5d7] bg-white px-4 transition focus-within:border-[#003fb1] focus-within:ring-4 focus-within:ring-[#dbe1ff]">
                  <UserRound className="h-5 w-5 text-[#737686]" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    className="w-full bg-transparent text-base text-[#191b23] outline-none placeholder:text-[#737686]"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#191b23]" htmlFor="email">
                  Email
                </label>
                <div className="mt-2 flex h-14 items-center gap-3 rounded-md border border-[#c3c5d7] bg-white px-4 transition focus-within:border-[#003fb1] focus-within:ring-4 focus-within:ring-[#dbe1ff]">
                  <Mail className="h-5 w-5 text-[#737686]" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="w-full bg-transparent text-base text-[#191b23] outline-none placeholder:text-[#737686]"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#191b23]" htmlFor="studentId">
                  Student ID
                </label>
                <div className="mt-2 flex h-14 items-center gap-3 rounded-md border border-[#c3c5d7] bg-white px-4 transition focus-within:border-[#003fb1] focus-within:ring-4 focus-within:ring-[#dbe1ff]">
                  <IdCard className="h-5 w-5 text-[#737686]" />
                  <input
                    id="studentId"
                    type="text"
                    autoComplete="off"
                    className="w-full bg-transparent text-base text-[#191b23] outline-none placeholder:text-[#737686]"
                    placeholder="FT-2024-001"
                    value={studentId}
                    onChange={(event) => setStudentId(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#191b23]" htmlFor="password">
                  Password
                </label>
                <div className="mt-2 flex h-14 items-center gap-3 rounded-md border border-[#c3c5d7] bg-white px-4 transition focus-within:border-[#003fb1] focus-within:ring-4 focus-within:ring-[#dbe1ff]">
                  <LockKeyhole className="h-5 w-5 text-[#737686]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="w-full bg-transparent text-base text-[#191b23] outline-none placeholder:text-[#737686]"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[#737686] transition hover:bg-[#f3f3fe] hover:text-[#003fb1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003fb1]"
                    aria-label={showPassword ? 'Hide characters' : 'Reveal characters'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error ? (
                <p className="flex items-start gap-3 rounded-md bg-[#ffdad6] px-4 py-3 text-sm font-medium text-[#93000a]" role="alert">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#003fb1] px-5 text-base font-semibold text-white shadow-[0_8px_24px_rgba(0,63,177,0.2)] transition hover:bg-[#1a56db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003fb1] disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                Create account
              </button>
            </form>

            <p className="mt-8 text-center text-base text-[#434654]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#003fb1] hover:text-[#1a56db]">
                Login
              </Link>
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#434654]">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Help Center</span>
          <span className="basis-full text-[#737686]">© 2024 FoundTrust Digital Reliability System.</span>
        </footer>
      </section>

      <AuthVisualPanel mode="register" />
    </main>
  )
}
