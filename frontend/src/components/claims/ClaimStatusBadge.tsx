import type { ClaimRequest } from '../../types'

const statusStyles: Record<ClaimRequest['status'], string> = {
  pending: 'bg-[#ffeadf] text-[#842c00]',
  approved: 'bg-[#dcfce7] text-[#166534]',
  rejected: 'bg-[#fee2e2] text-[#991b1b]',
}

export function ClaimStatusBadge({ status }: { status: ClaimRequest['status'] }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[status]}`}>{status}</span>
}