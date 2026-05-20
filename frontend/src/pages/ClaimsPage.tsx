import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ClipboardCheck } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { ClaimCard } from '../components/claims/ClaimCard'
import { getApiErrorMessage } from '../lib/api'
import { approveClaim, getClaims, rejectClaim } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { ClaimRequest, ClaimsResponse } from '../types'

export function ClaimsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const currentUserId = user?.id ?? null

  const { data: claims, isLoading, isError } = useQuery({
    queryKey: ['claims'],
    queryFn: getClaims,
  })

  const claimMutation = useMutation({
    mutationFn: async ({ claim, action }: { claim: ClaimRequest; action: 'approve' | 'reject' }) => {
      return action === 'approve' ? approveClaim(claim.id) : rejectClaim(claim.id)
    },
    onMutate: async ({ claim, action }) => {
      await queryClient.cancelQueries({ queryKey: ['claims'] })
      const previous = queryClient.getQueryData<ClaimsResponse>(['claims'])

      if (previous) {
        queryClient.setQueryData<ClaimsResponse>(['claims'], {
          sent: previous.sent.map((entry) => (entry.id === claim.id ? { ...entry, status: action === 'approve' ? 'approved' : 'rejected' } : entry)),
          received: previous.received.map((entry) => (entry.id === claim.id ? { ...entry, status: action === 'approve' ? 'approved' : 'rejected' } : entry)),
        })
      }

      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['claims'], context.previous)
      }

      toast.error(getApiErrorMessage(error, 'Unable to update claim.'))
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.action === 'approve' ? 'Claim approved.' : 'Claim rejected.')
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    },
  })

  const sentClaims = claims?.sent ?? []
  const receivedClaims = claims?.received ?? []

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-2xl border border-[#e2e1ed] bg-white" />
      ))}
    </div>
  )

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
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-[#191b23]">Claims I Sent [{sentClaims.length}]</h2>
          </div>
          {claims ? (
            sentClaims.length > 0 ? (
              <div className="space-y-4">
                {sentClaims.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} currentUserId={currentUserId} />
                ))}
              </div>
            ) : (
              <EmptyState title="No sent claims yet" description="Claims you submit will appear here." />
            )
          ) : renderSkeleton()}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-[#191b23]">Claims I Received [{receivedClaims.length}]</h2>
          </div>
          {claims ? (
            receivedClaims.length > 0 ? (
              <div className="space-y-4">
                {receivedClaims.map((claim) => (
                  <ClaimCard
                    key={claim.id}
                    claim={claim}
                    currentUserId={currentUserId}
                    onApprove={(selectedClaim) => claimMutation.mutate({ claim: selectedClaim, action: 'approve' })}
                    onReject={(selectedClaim) => claimMutation.mutate({ claim: selectedClaim, action: 'reject' })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No received claims yet" description="Claims on items you reported will appear here." />
            )
          ) : renderSkeleton()}
        </section>
      </div>
    </section>
  )
}
