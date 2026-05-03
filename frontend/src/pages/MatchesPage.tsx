import { MatchCard } from '../components/MatchCard'
import { matches } from '../lib/mockData'

export function MatchesPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Matches</h1>
        <p className="text-slate-600">Review suggested item matches and their confidence scores.</p>
      </div>
      <div className="space-y-4">
        {matches.map((match) => <MatchCard key={match.id} match={match} />)}
      </div>
    </section>
  )
}
