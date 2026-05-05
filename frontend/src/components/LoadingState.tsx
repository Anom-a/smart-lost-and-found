import { Loader2 } from 'lucide-react'

export function LoadingState({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e2e1ed] bg-white p-5 text-[#434654] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>{message}</span>
    </div>
  )
}
