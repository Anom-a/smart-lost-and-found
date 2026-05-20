import { format } from 'date-fns'
import type { ClaimRequest } from '../../types'
import { ClaimStatusBadge } from './ClaimStatusBadge'

type ClaimCardProps = {
  claim: ClaimRequest
  currentUserId: number | null
  onApprove?: (claim: ClaimRequest) => void
  onReject?: (claim: ClaimRequest) => void
}

export function ClaimCard({ claim, currentUserId, onApprove, onReject }: ClaimCardProps) {
  const canReview = claim.status === 'pending' && currentUserId === claim.found_item.reporter.id

  return (
    <article className="rounded-2xl border border-[#e2e1ed] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#191b23]">{claim.claimant.name}</p>
          <p className="text-xs text-[#737686]">{claim.claimant.student_id ?? 'No student ID provided'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#737686]">{format(new Date(claim.created_at), 'MMM d, yyyy h:mm a')}</span>
          <ClaimStatusBadge status={claim.status} />
        </div>
      </div>

      <blockquote className="mt-4 rounded-xl bg-[#f3f3fe] p-4 text-sm leading-6 text-[#434654]">
        {claim.proof_message}
      </blockquote>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[#e2e1ed] p-4">
          <p className="text-xs font-semibold uppercase text-[#737686]">Lost item</p>
          <h3 className="mt-1 text-base font-semibold text-[#191b23]">{claim.lost_item.title}</h3>
          <p className="mt-1 text-sm text-[#434654]">{claim.lost_item.category ?? 'Uncategorized'}</p>
          <p className="mt-1 text-sm text-[#737686]">{claim.lost_item.location ?? 'Unknown location'}</p>
        </div>
        <div className="rounded-xl border border-[#e2e1ed] p-4">
          <p className="text-xs font-semibold uppercase text-[#737686]">Found item</p>
          <h3 className="mt-1 text-base font-semibold text-[#191b23]">{claim.found_item.title}</h3>
          <p className="mt-1 text-sm text-[#434654]">{claim.found_item.category ?? 'Uncategorized'}</p>
          <p className="mt-1 text-sm text-[#737686]">{claim.found_item.location ?? 'Unknown location'}</p>
        </div>
      </div>

      {canReview && onApprove && onReject ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onApprove(claim)}
            className="inline-flex h-11 items-center rounded-lg bg-[#166534] px-4 text-sm font-semibold text-white transition hover:bg-[#15803d]"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onReject(claim)}
            className="inline-flex h-11 items-center rounded-lg bg-[#b91c1c] px-4 text-sm font-semibold text-white transition hover:bg-[#dc2626]"
          >
            Reject
          </button>
        </div>
      ) : null}
    </article>
  )
}