import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ItemCard } from '../components/ItemCard'
import { LoadingState } from '../components/LoadingState'
import { MatchCard } from '../components/MatchCard'
import { ClaimForm } from '../components/claims/ClaimForm'
import { useAuth } from '../hooks/useAuth'
import { fetchLostItem, fetchLostItemMatches } from '../lib/apiData'
import type { ClaimRequest } from '../types'

export function LostItemDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const itemId = Number(id)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [selectedFoundItemId, setSelectedFoundItemId] = useState<number | null>(null)
  const [submittedFoundItemIds, setSubmittedFoundItemIds] = useState<number[]>([])
  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['lost-item', itemId],
    queryFn: () => fetchLostItem(itemId),
    enabled: Number.isFinite(itemId),
  })

  const { data: matches = [], isLoading: isMatchesLoading } = useQuery({
    queryKey: ['lost-item-matches', itemId],
    queryFn: () => fetchLostItemMatches(itemId),
    enabled: Number.isFinite(itemId),
  })

  const selectedMatch = useMemo(() => matches.find((match) => match.foundItemId === selectedFoundItemId) ?? null, [matches, selectedFoundItemId])

  function openClaimModal(foundItemId: number) {
    setSelectedFoundItemId(foundItemId)
    setIsClaimModalOpen(true)
  }

  function closeClaimModal() {
    setIsClaimModalOpen(false)
    setSelectedFoundItemId(null)
  }

  function handleClaimSuccess(claim: ClaimRequest) {
    setSubmittedFoundItemIds((current) => (current.includes(claim.found_item.id) ? current : [...current, claim.found_item.id]))
    closeClaimModal()
    toast.success('Claim request sent.')
  }

  if (!Number.isFinite(itemId)) {
    return <EmptyState title="Lost item not found" description="The requested item could not be located." />
  }

  if (isLoading) return <LoadingState message="Loading lost item..." />
  if (isError) return <ErrorState title="Lost item not found" description="The requested item could not be loaded from the API." />

  if (!item) {
    return <EmptyState title="Lost item not found" description="The requested item could not be located." />
  }

  return (
    <section className="space-y-6">
      <ItemCard item={item} showViewDetails={false} />

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#191b23]">Suggested Matches</h2>
          <p className="mt-1 text-[#737686]">Review matching found items and send a claim request when appropriate.</p>
        </div>

        {isMatchesLoading ? <LoadingState message="Loading matches..." /> : null}

        {!isMatchesLoading && matches.length === 0 ? (
          <EmptyState title="No matches yet" description="Potential matches for this lost item will appear here." />
        ) : null}

        <div className="space-y-4">
          {matches.map((match) => {
            const isSubmitted = submittedFoundItemIds.includes(match.foundItemId)

            return (
              <MatchCard
                key={match.id}
                match={match}
                actionLabel={isSubmitted ? 'Claim Submitted' : 'Send Claim Request'}
                actionDisabled={isSubmitted}
                onAction={() => openClaimModal(match.foundItemId)}
              />
            )
          })}
        </div>
      </section>

      {isClaimModalOpen && selectedMatch ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-[#191b23]">Send Claim Request</h3>
                <p className="mt-1 text-sm text-[#737686]">Submit proof for {selectedMatch.foundItemTitle}.</p>
              </div>
              <button type="button" onClick={closeClaimModal} className="rounded-full px-3 py-1 text-sm font-semibold text-[#434654] transition hover:bg-[#f3f3fe]">
                Close
              </button>
            </div>
            <ClaimForm
              lostItemId={itemId}
              foundItemId={selectedMatch.foundItemId}
              onSuccess={handleClaimSuccess}
              onCancel={closeClaimModal}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
