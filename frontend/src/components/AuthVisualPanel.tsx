import { LockKeyhole, ShieldCheck } from 'lucide-react'

type AuthVisualPanelProps = {
  mode: 'login' | 'register'
}

export function AuthVisualPanel({ mode }: AuthVisualPanelProps) {
  const isRegister = mode === 'register'

  return (
    <aside className="relative hidden min-h-[calc(100vh-2rem)] overflow-hidden rounded-[32px] bg-[#13201c] p-8 text-white lg:flex lg:items-center">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(244,198,106,0.18),transparent_42%),linear-gradient(45deg,transparent_62%,rgba(219,229,223,0.16))]" />
      <div className="relative mx-auto grid w-full max-w-3xl gap-8">
        <div>
          <p className="text-sm font-semibold uppercase text-[#f4c66a]">FoundTrust</p>
          <h2 className="mt-3 max-w-xl text-4xl font-bold leading-tight">
            {isRegister ? 'Create a secure recovery profile.' : 'Pick up where your search left off.'}
          </h2>
          <p className="mt-4 max-w-lg text-base text-[#dbe5df]">
            {isRegister 
              ? 'Join thousands of students recovering lost items securely and quickly.'
              : 'Find your lost items with AI-powered matching and real-time notifications.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Privacy', icon: LockKeyhole },
            { label: 'Security', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon

            return (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <Icon className="h-5 w-5 text-[#f4c66a]" />
                <p className="mt-3 text-sm font-semibold">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
