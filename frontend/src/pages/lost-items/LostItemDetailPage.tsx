import { useParams } from 'react-router-dom'

export function LostItemDetailPage() {
  const { id } = useParams()

  return (
    <section className="page-stack">
      <p className="eyebrow">Lost item</p>
      <h1>Lost item #{id}</h1>
      <p>Detailed item information and match actions will be shown here.</p>
    </section>
  )
}
