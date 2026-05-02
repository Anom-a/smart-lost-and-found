import { ItemReportForm } from '../../components/forms/ItemReportForm'

export function NewFoundItemPage() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Report</p>
          <h1>New found item</h1>
        </div>
      </div>
      <ItemReportForm mode="found" />
    </section>
  )
}
