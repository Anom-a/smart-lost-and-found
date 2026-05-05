import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CheckCircle2,
  ClipboardList,
  Database,
  Filter,
  Handshake,
  HeartHandshake,
  KeyRound,
  Laptop,
  Loader2,
  LockKeyhole,
  MapPin,
  Menu,
  PackageSearch,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  UserCheck,
  WalletCards,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { fetchFoundItems, fetchLostItems } from '../lib/apiData'
import { useAuth } from '../hooks/useAuth'
import type { Item, ItemType } from '../types/models'

const fallbackCategories = ['Electronics', 'IDs', 'Bags', 'Keys', 'Documents', 'Pets']

const iconByCategory: Record<string, typeof PackageSearch> = {
  electronics: Laptop,
  ids: BadgeCheck,
  bags: WalletCards,
  keys: KeyRound,
  documents: ClipboardList,
  pets: HeartHandshake,
}

const statusCopy: Record<Item['status'], string> = {
  open: 'Lost',
  available: 'Found',
  claimed: 'Claimed',
  closed: 'Returned',
}

const statusStyles: Record<Item['status'], string> = {
  open: 'bg-[#ffdbce] text-[#7f2b00]',
  available: 'bg-[#dbe1ff] text-[#003dab]',
  claimed: 'bg-[#e2e1ed] text-[#434654]',
  closed: 'bg-[#85f8c4] text-[#005137]',
}

const processSteps = [
  {
    title: 'Report',
    description: 'Share item details, photos, timing, and the last known location.',
    icon: ClipboardList,
  },
  {
    title: 'Match',
    description: 'Guardian Logic compares reports and highlights strong candidates.',
    icon: PackageSearch,
  },
  {
    title: 'Verify',
    description: 'Ownership proof and identity checks keep claims controlled.',
    icon: ShieldCheck,
  },
  {
    title: 'Reclaim',
    description: 'Meet safely, close the report, and notify everyone involved.',
    icon: Handshake,
  },
]

function itemMatches(item: Item, search: string, category: string, feedType: ItemType) {
  if (item.type !== feedType) return false

  const haystack = `${item.title} ${item.category} ${item.location} ${item.description}`.toLowerCase()
  const matchesSearch = !search.trim() || haystack.includes(search.toLowerCase())
  const matchesCategory = category === 'All' || item.category.toLowerCase() === category.toLowerCase()

  return matchesSearch && matchesCategory
}

function categoryIcon(category: string) {
  const normalized = category.toLowerCase().replace(/[^a-z]/g, '')
  const key = Object.keys(iconByCategory).find((candidate) => normalized.includes(candidate.replace(/s$/, '')))

  return key ? iconByCategory[key] : Tag
}

function itemDetailPath(item: Item) {
  return item.type === 'lost' ? `/lost-items/${item.id}` : `/found-items/${item.id}`
}

function EmptyImage({ category, type }: { category: string; type: ItemType }) {
  const Icon = categoryIcon(category)

  return (
    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#ededf8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(26,86,219,0.18),transparent_28%),radial-gradient(circle_at_78%_70%,rgba(0,108,74,0.16),transparent_24%)]" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <Icon className={type === 'lost' ? 'h-9 w-9 text-[#ac3c00]' : 'h-9 w-9 text-[#003fb1]'} />
      </div>
    </div>
  )
}

function LandingItemCard({ item }: { item: Item }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-[#c3c5d7] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
        ) : (
          <EmptyImage category={item.category} type={item.type} />
        )}
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[item.status]}`}>
          {statusCopy[item.status]}
        </span>
      </div>
      <div className="p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-[#003fb1]">
          <Tag className="h-3.5 w-3.5" />
          {item.category}
        </p>
        <h3 className="mt-2 line-clamp-1 text-[20px] font-semibold leading-7 text-[#191b23]">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#434654]">{item.description}</p>
        <div className="mt-4 space-y-2 text-sm text-[#434654]">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#006c4a]" />
            {item.location}
          </p>
          <p className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-[#842c00]" />
            {format(new Date(item.date), 'MMM d, yyyy')}
          </p>
        </div>
        <Link
          to={itemDetailPath(item)}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#c3c5d7] text-sm font-semibold text-[#003fb1] transition hover:border-[#003fb1] hover:bg-[#f3f3fe]"
        >
          View details
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  )
}

export function HomePage() {
  const [feedType, setFeedType] = useState<ItemType>('found')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [activeStep, setActiveStep] = useState(1)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const categories = useCategories()
  const lostItems = useQuery({ queryKey: ['lost-items'], queryFn: fetchLostItems })
  const foundItems = useQuery({ queryKey: ['found-items'], queryFn: fetchFoundItems })

  const allItems = useMemo(() => [...(foundItems.data ?? []), ...(lostItems.data ?? [])], [foundItems.data, lostItems.data])
  const categoryNames = categories.data?.length ? categories.data.map((item) => item.name) : fallbackCategories
  const filteredItems = allItems.filter((item) => itemMatches(item, search, category, feedType)).slice(0, 6)
  const loadingItems = lostItems.isLoading || foundItems.isLoading
  const returnedCount = allItems.filter((item) => item.status === 'closed').length
  const activeReports = allItems.filter((item) => item.status === 'open' || item.status === 'available').length
  const liveLocations = allItems.filter((item) => item.location && item.location !== 'Not specified').slice(0, 5)
  const recentItem = allItems[0]

  return (
    <main className="min-h-screen bg-[#faf8ff] text-[#191b23]">
      <header className="sticky top-0 z-30 border-b border-[#e2e1ed]/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-bold tracking-tight text-[#003fb1]">
            FoundTrust
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#434654] md:flex">
            <a href="#feed" className="hover:text-[#003fb1]">Browse items</a>
            <a href="#process" className="hover:text-[#003fb1]">How it works</a>
            <a href="#trust" className="hover:text-[#003fb1]">Safety guide</a>
            <a href="#impact" className="hover:text-[#003fb1]">Community</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="text-sm font-semibold text-[#434654] hover:text-[#003fb1]">
              {isAuthenticated ? 'Dashboard' : 'Sign in'}
            </Link>
            <Link to="/lost-items/new" className="inline-flex h-11 items-center justify-center rounded-md bg-[#003fb1] px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,63,177,0.2)] hover:bg-[#1a56db]">
              Report item
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#c3c5d7] text-[#003fb1] md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileNavOpen ? (
          <div className="border-t border-[#e2e1ed] bg-white px-4 py-4 md:hidden">
            <div className="grid gap-3 text-sm font-semibold text-[#434654]">
              <a href="#feed" onClick={() => setMobileNavOpen(false)}>Browse items</a>
              <a href="#process" onClick={() => setMobileNavOpen(false)}>How it works</a>
              <a href="#trust" onClick={() => setMobileNavOpen(false)}>Safety guide</a>
              <Link to={isAuthenticated ? '/dashboard' : '/login'}>{isAuthenticated ? 'Dashboard' : 'Sign in'}</Link>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#faf8ff_0%,#faf8ff_48%,#eaf7f1_100%)]" />
        <div className="relative mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#006c4a] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <ShieldCheck className="h-4 w-4" />
              Digital reliability for lost and found
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.12] tracking-[-0.02em] text-[#191b23] sm:text-5xl lg:text-6xl">
              Find What&apos;s Lost. <span className="text-[#003fb1]">Return What&apos;s Found.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-7 text-[#434654]">
              A secure community platform that helps people report lost items, search found property, and verify safe handoffs with less stress.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/lost-items/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#003fb1] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,63,177,0.2)] hover:bg-[#1a56db]">
                <PackageSearch className="h-4 w-4" />
                Report lost item
              </Link>
              <a
                href="#feed"
                onClick={() => setFeedType('found')}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#c3c5d7] bg-white px-5 text-sm font-semibold text-[#003fb1] hover:border-[#003fb1]"
              >
                <Search className="h-4 w-4" />
                Browse found items
              </a>
            </div>

            <form
              className="mt-10 grid gap-3 rounded-lg bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:grid-cols-[1fr_auto_auto]"
              onSubmit={(event) => {
                event.preventDefault()
                document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <label className="flex h-12 items-center gap-3 rounded-md border border-transparent bg-[#faf8ff] px-4 focus-within:border-[#003fb1]">
                <Search className="h-4 w-4 text-[#737686]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="What did you lose?"
                  className="w-full bg-transparent text-sm text-[#191b23] outline-none placeholder:text-[#737686]"
                />
              </label>
              <label className="flex h-12 items-center gap-3 rounded-md border border-[#e2e1ed] bg-white px-4 text-sm text-[#434654]">
                <SlidersHorizontal className="h-4 w-4 text-[#737686]" />
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent outline-none">
                  <option>All</option>
                  {categoryNames.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="inline-flex h-12 items-center justify-center rounded-md bg-[#003fb1] px-6 text-sm font-semibold text-white hover:bg-[#1a56db]">
                Search
              </button>
            </form>
          </div>

          <div className="relative min-h-[420px]">
            <div className="absolute left-4 top-8 h-56 w-56 rounded-full bg-[#85f8c4]/35 blur-3xl" />
            <div className="absolute bottom-8 right-2 h-64 w-64 rounded-full bg-[#b5c4ff]/45 blur-3xl" />
            <div className="relative ml-auto max-w-xl rounded-lg border border-[#c3c5d7] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <div className="rounded-md bg-[#ededf8] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(allItems.length ? allItems.slice(0, 4) : []).map((item) => (
                    <div key={`${item.type}-${item.id}`} className="rounded-md bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                      <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#737686]">
                        {item.type}
                        <span className={item.type === 'lost' ? 'text-[#842c00]' : 'text-[#006c4a]'}>{item.category}</span>
                      </p>
                      <p className="mt-3 line-clamp-1 font-semibold text-[#191b23]">{item.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-[#434654]">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                      </p>
                    </div>
                  ))}
                  {!allItems.length ? (
                    <>
                      <div className="rounded-md bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#737686]">Ready for reports</p>
                        <p className="mt-3 font-semibold text-[#191b23]">Live item cards appear here</p>
                        <p className="mt-1 text-sm text-[#434654]">Connected to the public item APIs.</p>
                      </div>
                      <div className="rounded-md bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#737686]">Guardian Logic</p>
                        <p className="mt-3 font-semibold text-[#191b23]">Matching pipeline active</p>
                        <p className="mt-1 text-sm text-[#434654]">Reports are compared as they arrive.</p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 grid gap-3 rounded-md border border-[#e2e1ed] bg-[#faf8ff] p-4 sm:grid-cols-[1fr_auto_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#737686]">Lost report</p>
                  <p className="mt-1 font-semibold text-[#191b23]">{lostItems.data?.[0]?.title ?? 'Waiting for lost item'}</p>
                </div>
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#003fb1]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#737686]">Found candidate</p>
                  <p className="mt-1 font-semibold text-[#191b23]">{foundItems.data?.[0]?.title ?? 'Waiting for found item'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="feed" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#003fb1]">Live item feed</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.01em] text-[#191b23]">Real-time reports from your community</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#434654]">
              Search and filter reports from the backend. Switch between lost and found items without leaving the page.
            </p>
          </div>
          <div className="flex w-fit rounded-md border border-[#c3c5d7] bg-white p-1">
            {(['found', 'lost'] as ItemType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFeedType(type)}
                className={`h-10 rounded px-4 text-sm font-semibold capitalize transition ${feedType === type ? 'bg-[#003fb1] text-white' : 'text-[#434654] hover:bg-[#f3f3fe]'}`}
              >
                {type} items
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('All')}
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold ${category === 'All' ? 'bg-[#003fb1] text-white' : 'border border-[#c3c5d7] bg-white text-[#434654]'}`}
          >
            <Filter className="h-3.5 w-3.5" />
            All
          </button>
          {categoryNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={`h-9 rounded-full px-4 text-sm font-semibold transition ${category === name ? 'bg-[#003fb1] text-white' : 'border border-[#c3c5d7] bg-white text-[#434654] hover:border-[#003fb1]'}`}
            >
              {name}
            </button>
          ))}
        </div>

        {loadingItems ? (
          <div className="mt-10 flex items-center gap-3 rounded-lg border border-[#c3c5d7] bg-white p-6 text-[#434654]">
            <Loader2 className="h-5 w-5 animate-spin text-[#003fb1]" />
            Loading live reports...
          </div>
        ) : filteredItems.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <LandingItemCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-[#c3c5d7] bg-white p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <Database className="mx-auto h-8 w-8 text-[#003fb1]" />
            <h3 className="mt-4 text-xl font-semibold text-[#191b23]">No matching reports yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#434654]">
              The page is connected to real item data. Try another filter, or create the first report for this category.
            </p>
          </div>
        )}
      </section>

      <section id="process" className="border-y border-[#e2e1ed] bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-[#191b23]">How it works</h2>
            <p className="mt-3 text-sm leading-6 text-[#434654]">A secure journey from missing report to verified return.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {processSteps.map((step, index) => {
              const Icon = step.icon
              const selected = activeStep === index

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`rounded-lg border p-6 text-left transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${selected ? 'border-[#003fb1] bg-[#f3f3fe]' : 'border-[#c3c5d7] bg-white'}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003fb1] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-5 text-sm font-semibold text-[#737686]">Step {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-[#191b23]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#434654]">{step.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section id="trust" className="bg-[#e2e1ed] py-16">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-[#191b23]">
              Built on Trust and <span className="text-[#003fb1]">Reliability.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#434654]">
              Every report is structured for verification, privacy, and safer exchanges. The product feels calm because the process is controlled.
            </p>
            <div className="mt-8 grid gap-4">
              <p className="flex gap-3 text-sm text-[#434654]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#85f8c4] text-[#005137]">
                  <UserCheck className="h-4 w-4" />
                </span>
                <span><strong className="text-[#191b23]">Verified meetings.</strong> Suggested public zones and identity checks support safer handoffs.</span>
              </p>
              <p className="flex gap-3 text-sm text-[#434654]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#85f8c4] text-[#005137]">
                  <LockKeyhole className="h-4 w-4" />
                </span>
                <span><strong className="text-[#191b23]">Encrypted data.</strong> Contact details stay controlled until claim steps require them.</span>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              [returnedCount || 'Ready', 'items returned'],
              [activeReports, 'active reports'],
              [categories.data?.length ?? fallbackCategories.length, 'tracked categories'],
              [recentItem ? formatDistanceToNow(new Date(recentItem.date), { addSuffix: true }) : 'Live', 'latest update'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg bg-white p-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <p className="text-3xl font-bold tracking-[-0.02em] text-[#003fb1]">{value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#737686]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.01em] text-[#191b23]">Community impact near you</h2>
          <p className="mt-3 text-sm leading-6 text-[#434654]">A live location preview of reported items and safer exchange areas.</p>
        </div>
        <div className="relative mt-10 min-h-[360px] overflow-hidden rounded-lg border border-[#c3c5d7] bg-[#d9d9e4] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(30deg,rgba(255,255,255,0.5)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,0.5)_87.5%,rgba(255,255,255,0.5)),linear-gradient(150deg,rgba(255,255,255,0.5)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,0.5)_87.5%,rgba(255,255,255,0.5)),linear-gradient(30deg,rgba(255,255,255,0.5)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,0.5)_87.5%,rgba(255,255,255,0.5)),linear-gradient(150deg,rgba(255,255,255,0.5)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,0.5)_87.5%,rgba(255,255,255,0.5))] [background-position:0_0,0_0,24px_42px,24px_42px] [background-size:48px_84px]" />
          {(liveLocations.length ? liveLocations : allItems.slice(0, 3)).map((item, index) => (
            <Link
              key={`${item.type}-pin-${item.id}`}
              to={itemDetailPath(item)}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#191b23] shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition hover:scale-105"
              style={{
                left: `${18 + ((index * 17) % 66)}%`,
                top: `${30 + ((index * 19) % 45)}%`,
              }}
            >
              <MapPin className={item.type === 'lost' ? 'h-4 w-4 text-[#ac3c00]' : 'h-4 w-4 text-[#003fb1]'} />
              <span className="hidden sm:inline">{item.location}</span>
            </Link>
          ))}
          <div className="absolute bottom-6 left-6 max-w-xs rounded-lg bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <p className="text-sm font-semibold text-[#191b23]">{liveLocations[0]?.location ?? 'Community coverage'}</p>
            <p className="mt-1 text-sm leading-5 text-[#434654]">
              {liveLocations[0] ? `${liveLocations[0].title} was reported in this area.` : 'Reported item clusters will appear as your community adds data.'}
            </p>
            <a href="#feed" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#003fb1]">
              View local feed
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#003fb1] py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[#85f8c4]" />
          <h2 className="mt-5 text-3xl font-bold tracking-[-0.02em]">Don&apos;t lose hope. Start your search now.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#d4dcff]">
            Join your community in returning valuable belongings through a calmer, safer, and more reliable process.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/lost-items/new" className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-[#003fb1] hover:bg-[#f3f3fe]">
              Report your item
            </Link>
            <a
              href="#feed"
              onClick={() => setFeedType('found')}
              className="inline-flex h-12 items-center justify-center rounded-md border border-white px-6 text-sm font-semibold text-white hover:bg-white/10"
            >
              Search database
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#faf8ff] py-10">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 text-sm text-[#434654] sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Link to="/" className="font-bold text-[#191b23]">FoundTrust</Link>
            <p className="mt-3 max-w-sm leading-6">The digital standard for secure, community-driven lost and found services.</p>
          </div>
          <div>
            <p className="font-semibold text-[#191b23]">Platform</p>
            <div className="mt-3 grid gap-2">
              <a href="#feed">Browse items</a>
              <a href="#process">How it works</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#191b23]">Company</p>
            <div className="mt-3 grid gap-2">
              <a href="#trust">Safety</a>
              <a href="#impact">Community</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#191b23]">Legal</p>
            <div className="mt-3 grid gap-2">
              <span>Terms of service</span>
              <span>Privacy policy</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
