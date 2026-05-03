import { useQuery } from '@tanstack/react-query'
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
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Matches</h1>
        <p className="text-slate-600">Review suggested item matches and their confidence scores.</p>
      </div>
      <div className="space-y-4">
        {matches.length > 0 ? (
          matches.map((match) => <MatchCard key={match.id} match={match} />)
        ) : (
          <EmptyState title="No matches yet" description="Matching results will appear here." />
        )}
      </div>
    </section>
  )
}
