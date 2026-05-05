import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { MatchCard } from '../components/MatchCard'
import { fetchMatches } from '../lib/apiData'

export function MatchesPage() {
  const { data: matches = [], isLoading, isError } = useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
  })

  if (isLoading) return <LoadingState message="Loading suggested matches..." />
  if (isError) return <ErrorState description="Unable to load matches from the API." />

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#003fb1]">
          <Sparkles className="h-4 w-4" />
          Verification engine
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#191b23]">Matches</h1>
        <p className="mt-2 text-[#434654]">Review suggested item matches and their confidence scores.</p>
      </div>
      <div className="space-y-5">
        {matches.length > 0 ? (
          matches.map((match) => <MatchCard key={match.id} match={match} />)
        ) : (
          <EmptyState title="No matches yet" description="Matching results will appear here." />
        )}
      </div>
    </section>
  )
}
