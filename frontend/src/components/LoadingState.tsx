import { Loader2 } from 'lucide-react'

export function LoadingState({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-slate-700">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>{message}</span>
    </div>
  )
}
