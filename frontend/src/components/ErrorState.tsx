type ErrorStateProps = {
  title?: string
  description: string
}

export function ErrorState({ title = 'Something went wrong', description }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-[#ffdad6] bg-[#fff2f0] p-5 text-[#93000a]">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  )
}
