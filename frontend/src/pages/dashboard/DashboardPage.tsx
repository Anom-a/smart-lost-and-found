import { Link } from 'react-router-dom'

const stats = [
  { label: 'Open lost reports', value: 24 },
  { label: 'Found items', value: 18 },
  { label: 'Suggested matches', value: 7 },
  { label: 'Pending claims', value: 5 },
]

export function DashboardPage() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
        <Link className="button button-primary" to="/lost-items/new">
          Report lost item
        </Link>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
