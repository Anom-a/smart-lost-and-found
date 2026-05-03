import { claims } from '../lib/mockData'

export function ClaimsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Claims</h1>
        <p className="text-slate-600">Track ownership claims for found items.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {claims.map((claim) => (
          <article key={claim.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">{claim.claimant}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">{claim.status}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{claim.reason}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
