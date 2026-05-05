import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BellRing, ClipboardCheck, Download, Handshake, Inbox, Search, Sparkles, TrendingUp } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ItemCard } from '../components/ItemCard'
import { LoadingState } from '../components/LoadingState'
import { MatchCard } from '../components/MatchCard'
import { fetchClaims, fetchFoundItems, fetchLostItems, fetchMatches } from '../lib/apiData'

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [lostItems, foundItems, matches, claims] = await Promise.all([
        fetchLostItems(),
        fetchFoundItems(),
        fetchMatches(),
        fetchClaims(),
      ])
      const items = [...lostItems, ...foundItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return {
        stats: {
          openLostItems: lostItems.filter((item) => item.status === 'open').length,
          openFoundItems: foundItems.filter((item) => item.status === 'available').length,
          activeMatches: matches.length,
          pendingClaims: claims.filter((claim) => claim.status === 'pending').length,
        },
        recentItems: items.slice(0, 3),
        recentMatches: matches.slice(0, 2),
        recentClaims: claims.slice(0, 2),
      }
    },
  })

  if (isLoading) return <LoadingState message="Loading dashboard..." />
  if (isError || !data) return <ErrorState description="Unable to load dashboard data from the API." />

  const { stats, recentItems, recentMatches, recentClaims } = data
  const returnedClaims = recentClaims.filter((claim) => claim.status === 'approved').length
  const statCards = [
    { label: 'Open Lost Reports', value: stats.openLostItems, icon: Search, tone: 'bg-[#dbe1ff] text-[#003fb1]', chip: 'Live' },
    { label: 'Found Items', value: stats.openFoundItems, icon: Inbox, tone: 'bg-[#85f8c4] text-[#005137]', chip: 'Available' },
    { label: 'Active Matches', value: stats.activeMatches, icon: Handshake, tone: 'bg-[#ffdbce] text-[#842c00]', chip: 'Review' },
    { label: 'Pending Claims', value: stats.pendingClaims, icon: ClipboardCheck, tone: 'bg-[#e2e1ed] text-[#191b23]', chip: 'Urgent' },
  ]

  return (
    <section className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#006c4a]">Overview</p>
          <h1 className="mt-1 text-4xl font-bold leading-[44px] text-[#191b23]">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-lg leading-7 text-[#434654]">
            Track open reports, active matches, and claims across the Smart Lost and Found system.
          </p>
        </div>
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#c3c5d7] px-5 text-sm font-semibold text-[#003fb1] transition hover:border-[#003fb1] hover:bg-[#f3f3fe]">
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.tone}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-[#f3f3fe] px-3 py-1 text-sm font-medium text-[#434654]">{card.chip}</span>
            </div>
            <p className="mt-6 text-sm font-medium text-[#434654]">{card.label}</p>
            <p className="mt-2 text-4xl font-bold text-[#191b23]">{card.value.toLocaleString()}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-7">
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#191b23]">
                <Sparkles className="h-6 w-6 text-[#003fb1]" />
                High-Confidence Matches
              </h2>
              <Link to="/matches" className="text-sm font-semibold text-[#003fb1]">View All Matches</Link>
            </div>
            <div className="space-y-5">
              {recentMatches.length > 0 ? recentMatches.map((match) => <MatchCard key={match.id} match={match} />) : <EmptyState title="No matches yet" description="Matching results will appear here." />}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[#191b23]">Recent Items</h2>
              <Link to="/lost-items" className="text-sm font-semibold text-[#003fb1]">View All Items</Link>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {recentItems.length > 0 ? recentItems.map((item) => <ItemCard key={item.id} item={item} />) : <EmptyState title="No items yet" description="Item reports will appear here." />}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[#191b23]">Recent Activity</h2>
              <BellRing className="h-5 w-5 text-[#003fb1]" />
            </div>
            <div className="space-y-5">
              {recentItems.slice(0, 3).map((item) => (
                <div key={`${item.type}-${item.id}`} className="relative pl-6">
                  <span className={`absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ${item.type === 'found' ? 'bg-[#006c4a]' : 'bg-[#ea580c]'}`} />
                  <p className="font-medium text-[#191b23]">{item.type === 'found' ? 'New Found Item' : 'New Lost Report'}</p>
                  <p className="mt-1 text-sm leading-6 text-[#737686]">{item.title} reported at {item.location}.</p>
                  <p className="mt-1 text-xs font-medium text-[#737686]">{format(new Date(item.date), 'MMM d, yyyy')}</p>
                </div>
              ))}
              {recentItems.length === 0 ? <EmptyState title="No activity" description="New item activity will appear here." /> : null}
            </div>
            <Link to="/notifications" className="mt-6 flex h-12 items-center justify-center rounded-lg border border-[#c3c5d7] text-sm font-semibold text-[#003fb1] transition hover:border-[#003fb1] hover:bg-[#f3f3fe]">
              View All Activity
            </Link>
          </section>

          <section className="rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[#191b23]">Claims Needing Review</h2>
              <span className="rounded-full bg-[#ffdad6] px-2.5 py-1 text-xs font-semibold text-[#93000a]">{stats.pendingClaims}</span>
            </div>
            <div className="space-y-4">
              {recentClaims.length > 0 ? (
                recentClaims.map((claim) => (
                  <article key={claim.id} className="rounded-lg bg-[#f3f3fe] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[#191b23]">{claim.claimant}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-[#434654]">{claim.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#737686]">Claim #{claim.id} for {claim.itemType} item #{claim.itemId}</p>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e2e1ed]">
                      <div className={`h-full rounded-full ${claim.status === 'approved' ? 'w-full bg-[#006c4a]' : claim.status === 'rejected' ? 'w-2/3 bg-[#ba1a1a]' : 'w-3/5 bg-[#842c00]'}`} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#842c00]">{claim.reason}</p>
                    <p className="mt-2 text-xs text-[#737686]">Submitted {format(new Date(claim.submittedAt), 'MMM d, yyyy')}</p>
                  </article>
                ))
              ) : (
                <EmptyState title="No claims yet" description="Submitted claims will appear here." />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#e2e1ed] bg-[#003fb1] p-6 text-white shadow-[0_8px_24px_rgba(0,63,177,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#d4dcff]">Returned through claims</p>
                <p className="text-2xl font-bold">{returnedClaims}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#d4dcff]">Approved claims are reflected from the current API response.</p>
          </section>
        </aside>
      </div>

      <section className="lg:hidden">
        <h2 className="mb-4 text-xl font-semibold text-[#191b23]">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/lost-items/new" className="flex h-12 items-center justify-center rounded-lg bg-[#003fb1] text-sm font-semibold text-white">Report lost item</Link>
          <Link to="/found-items/new" className="flex h-12 items-center justify-center rounded-lg border border-[#c3c5d7] text-sm font-semibold text-[#003fb1]">Report found item</Link>
        </div>
      </section>
    </section>
  )
}
