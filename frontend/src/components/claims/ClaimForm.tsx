import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { getApiErrorMessage } from '../../lib/api'
import { submitClaim } from '../../lib/api'
import type { ClaimRequest } from '../../types'

const schema = z.object({
  proof_message: z.string().min(20, 'Proof message must be at least 20 characters.').max(1000, 'Proof message must be 1000 characters or less.'),
})

type ClaimFormValues = z.infer<typeof schema>

type ClaimFormProps = {
  lostItemId: number
  foundItemId: number
  onSuccess: (claim: ClaimRequest) => void
  onCancel: () => void
}

export function ClaimForm({ lostItemId, foundItemId, onSuccess, onCancel }: ClaimFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { proof_message: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true)

    try {
      const claim = await submitClaim({
        lost_item_id: lostItemId,
        found_item_id: foundItemId,
        proof_message: values.proof_message,
      })

      toast.success('Claim submitted successfully.')
      onSuccess(claim)
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const status = (error as { response?: { status?: number } }).response?.status

        if (status === 409) {
          toast.error('You have already submitted a claim for this item.')
          return
        }
      }

      toast.error(getApiErrorMessage(error, 'Unable to submit claim.'))
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#191b23]" htmlFor="proof_message">
          Proof message
        </label>
        <textarea
          id="proof_message"
          rows={6}
          className="w-full rounded-xl border border-[#c3c5d7] bg-white px-4 py-3 text-[#191b23] outline-none transition focus:border-[#003fb1]"
          placeholder="Explain why this item belongs to you..."
          {...register('proof_message')}
        />
        {errors.proof_message ? <p className="mt-2 text-sm text-[#b91c1c]">{errors.proof_message.message}</p> : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center rounded-lg bg-[#003fb1] px-4 text-sm font-semibold text-white transition hover:bg-[#1a56db] disabled:cursor-not-allowed disabled:bg-[#c3c5d7]"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Claim'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-lg border border-[#c3c5d7] px-4 text-sm font-semibold text-[#434654] transition hover:bg-[#f3f3fe]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}