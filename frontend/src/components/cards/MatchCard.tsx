import type { Match } from '../../types'

export function MatchCard({ match }: { match: Match }) {
  return (
    <article className="item-card">
      <p className="eyebrow">{Math.round(match.confidence * 100)}% match</p>
      <h3>
        {match.lostItem.title} / {match.foundItem.title}
      </h3>
      <p>
        Lost near {match.lostItem.location}; found near {match.foundItem.location}.
      </p>
    </article>
  )
}
