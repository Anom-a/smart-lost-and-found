import {
  BadgeCheck,
  CheckCircle2,
  Handshake,
  Laptop,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'

type AuthVisualPanelProps = {
  mode: 'login' | 'register'
}

export function AuthVisualPanel({ mode }: AuthVisualPanelProps) {
  const isRegister = mode === 'register'

  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#f3f3fe] px-10 py-12 lg:flex lg:items-center">
      <div className="absolute right-10 top-10 h-56 w-56 rounded-full bg-[#dbe1ff]/60 blur-3xl" />
      <div className="absolute bottom-20 left-10 h-52 w-52 rounded-full bg-[#85f8c4]/30 blur-3xl" />
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="rounded-lg bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-[#e2e1ed]">
              <Laptop className="h-10 w-10 text-[#434654]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-semibold tracking-[-0.01em] text-[#191b23]">
                {isRegister ? 'Campus ID Card' : 'MacBook Pro 14"'}
              </h2>
              <p className="mt-1 text-base text-[#434654]">
                {isRegister ? 'Ready for verified community recovery' : 'Reported in Central Park, NY'}
              </p>
            </div>
            <span className="rounded-full bg-[#ffdbce] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#7f2b00]">
              Lost
            </span>
          </div>
        </div>

        <div className="mx-auto my-8 h-12 w-px bg-[#003fb1]" />

        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-[#68dba9] bg-[#85f8c4] px-6 py-3 text-base font-semibold text-[#005137] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <BadgeCheck className="h-5 w-5" />
          {isRegister ? 'Verified Access Setup' : '92% Match Confidence'}
        </div>

        <div className="mx-auto my-8 h-12 w-px bg-[#003fb1]" />

        <div className="rounded-lg bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-[#e2e1ed]">
              <LockKeyhole className="h-10 w-10 text-[#434654]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-semibold tracking-[-0.01em] text-[#191b23]">
                {isRegister ? 'Secure Profile' : 'Item #FT-8829'}
              </h2>
              <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-[#006c4a]">
                <CheckCircle2 className="h-5 w-5" />
                Ownership Verified
              </p>
            </div>
            <span className="rounded-full bg-[#85f8c4] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#005137]">
              Found
            </span>
          </div>
        </div>

        <div className="mt-14 border-t border-[#c3c5d7] pt-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { label: 'Verified Claims', icon: ShieldCheck },
              { label: 'Safe Meeting', icon: Handshake },
              { label: 'Protected Data', icon: LockKeyhole },
            ].map((item) => {
              const Icon = item.icon

              return (
                <div key={item.label} className="space-y-3">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dbe1ff] text-[#003fb1]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold text-[#191b23]">{item.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
