import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-md text-slate-600">The requested route does not exist in this frontend.</p>
      <Link to="/" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white">
        Go back home
      </Link>
    </div>
  )
}