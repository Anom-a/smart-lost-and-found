import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, Loader2, Tag } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'

export function HomePage() {
  const categories = useCategories()

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          <Tag className="h-4 w-4" />
          API connectivity check
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Backend categories from <span className="text-emerald-700">/api/categories</span>
        </h1>
        <p className="max-w-2xl text-slate-600">
          This page uses Axios, React Query, and the Vite proxy/env configuration to fetch the Laravel categories endpoint.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-500">Environment</p>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">API URL</dt>
            <dd className="mt-1 font-medium text-slate-900">{import.meta.env.VITE_API_URL ?? '/api'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Storage URL</dt>
            <dd className="mt-1 font-medium text-slate-900">{import.meta.env.VITE_STORAGE_URL ?? '/storage'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Client time</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {formatDistanceToNow(new Date(), { addSuffix: true })}
            </dd>
          </div>
        </dl>
      </div>

      {categories.isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading categories from the backend...
        </div>
      ) : categories.isError ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <AlertCircle className="h-5 w-5" />
          Failed to load categories. Check the backend, Vite proxy, or VITE_API_URL.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.data?.map((category) => (
            <article key={category.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{category.slug}</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{category.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {category.description ?? 'No description provided.'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}