import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ItemCard } from '../components/ItemCard'
import { MatchCard } from '../components/MatchCard'
import { claims, getDashboardStats, items, matches } from '../lib/mockData'

export function DashboardPage() {
  const stats = getDashboardStats()
  const recentItems = items.slice(0, 3)
  const recentMatches = matches.slice(0, 2)
  const recentClaims = claims.slice(0, 2)

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">Overview</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Track open reports, active matches, and claims across the Smart Lost and Found system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Open lost items', stats.openLostItems],
          ['Open found items', stats.openFoundItems],
          ['Active matches', stats.activeMatches],
          ['Pending claims', stats.pendingClaims],
        ].map(([label, value]) => (
          <article key={label as string} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{value as number}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Recent items</h2>
            <Link to="/lost-items" className="text-sm font-medium text-emerald-700">View all</Link>
          </div>
          <div className="space-y-4">
            {recentItems.length > 0 ? recentItems.map((item) => <ItemCard key={item.id} item={item} />) : <EmptyState title="No items yet" description="Item reports will appear here." />}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Active matches</h2>
            <Link to="/matches" className="text-sm font-medium text-emerald-700">View all</Link>
          </div>
          <div className="space-y-4">
            {recentMatches.length > 0 ? recentMatches.map((match) => <MatchCard key={match.id} match={match} />) : <EmptyState title="No matches yet" description="Matching results will appear here." />}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Recent claims</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {recentClaims.length > 0 ? (
            recentClaims.map((claim) => (
              <article key={claim.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-900">{claim.claimant}</p>
                <p className="mt-1 text-sm text-slate-600">{claim.reason}</p>
                <p className="mt-2 text-xs text-slate-500">Submitted {format(new Date(claim.submittedAt), 'MMM d, yyyy')}</p>
              </article>
            ))
          ) : (
            <EmptyState title="No claims yet" description="Submitted claims will appear here." />
          )}
        </div>
      </section>
    </section>
  )
}
