import { ItemReportForm } from '../../components/forms/ItemReportForm'

export function NewLostItemPage() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Report</p>
          <h1>New lost item</h1>
        </div>
      </div>
      <ItemReportForm mode="lost" />
    </section>
  )
}
