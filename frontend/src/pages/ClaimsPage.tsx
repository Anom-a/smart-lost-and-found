import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ClipboardCheck } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { fetchClaims } from '../lib/apiData'

export function ClaimsPage() {
  const { data: claims = [], isLoading, isError } = useQuery({
    queryKey: ['claims'],
    queryFn: fetchClaims,
  })

  if (isLoading) return <LoadingState message="Loading claims..." />
  if (isError) return <ErrorState description="Unable to load claims from the API." />

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#006c4a]">
          <ClipboardCheck className="h-4 w-4" />
          Ownership verification
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#191b23]">Claims</h1>
        <p className="mt-2 text-[#434654]">Track ownership claims for found items.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {claims.length > 0 ? claims.map((claim) => (
          <article key={claim.id} className="rounded-2xl border border-[#e2e1ed] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#191b23]">{claim.claimant}</h2>
              <span className="rounded-full bg-[#f3f3fe] px-3 py-1 text-xs font-semibold uppercase text-[#434654]">{claim.status}</span>
            </div>
            <p className="mt-2 text-sm text-[#737686]">Claim #{claim.id} for {claim.itemType} item #{claim.itemId}</p>
            <p className="mt-4 text-sm leading-6 text-[#434654]">{claim.reason}</p>
            <p className="mt-4 text-xs font-medium text-[#737686]">Submitted {format(new Date(claim.submittedAt), 'MMM d, yyyy')}</p>
          </article>
        )) : <EmptyState title="No claims yet" description="Submitted claims will appear here." />}
      </div>
    </section>
  )
}
