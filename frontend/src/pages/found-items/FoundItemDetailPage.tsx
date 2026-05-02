import { useParams } from 'react-router-dom'

export function FoundItemDetailPage() {
  const { id } = useParams()

  return (
    <section className="page-stack">
      <p className="eyebrow">Found item</p>
      <h1>Found item #{id}</h1>
      <p>Detailed item information and claim review actions will be shown here.</p>
    </section>
  )
}
