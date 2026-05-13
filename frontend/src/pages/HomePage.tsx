import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
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
import heroImage from '../assets/hero.png'

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
  available: 'bg-[#dbe5df] text-[#0d4237]',
  claimed: 'bg-[#e9e2d4] text-[#4d5753]',
  closed: 'bg-[#f4c66a] text-[#13201c]',
}

const processSteps = [
  {
    title: 'Report',
    description: 'Add details and a photo.',
    icon: ClipboardList,
  },
  {
    title: 'Match',
    description: 'Compare likely pairs.',
    icon: PackageSearch,
  },
  {
    title: 'Verify',
    description: 'Check ownership proof.',
    icon: ShieldCheck,
  },
  {
    title: 'Reclaim',
    description: 'Return and close.',
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
    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#dfe7e2]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(13,66,55,0.12),transparent_45%),linear-gradient(45deg,transparent_55%,rgba(244,198,106,0.32))]" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/90 shadow-[0_12px_28px_rgba(39,43,38,0.12)]">
        <Icon className={type === 'lost' ? 'h-9 w-9 text-[#ac3c00]' : 'h-9 w-9 text-[#0d4237]'} />
      </div>
    </div>
  )
}

function LandingItemCard({ item }: { item: Item }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#d7d0c2] bg-white shadow-[0_12px_28px_rgba(39,43,38,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(39,43,38,0.12)]">
      <div className="relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
        ) : (
          <EmptyImage category={item.category} type={item.type} />
        )}
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[item.status]}`}>
          {statusCopy[item.status]}
        </span>
      </div>
      <div className="p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-[#0d4237]">
          <Tag className="h-3.5 w-3.5" />
          {item.category}
        </p>
        <h3 className="mt-2 line-clamp-1 text-[20px] font-semibold leading-7 text-[#13201c]">{item.title}</h3>
        <div className="mt-4 space-y-2 text-sm text-[#4d5753]">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#0d4237]" />
            {item.location}
          </p>
          <p className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-[#842c00]" />
            {format(new Date(item.date), 'MMM d, yyyy')}
          </p>
        </div>
        <Link
          to={itemDetailPath(item)}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d7d0c2] text-sm font-semibold text-[#0d4237] transition hover:border-[#0d4237] hover:bg-[#eef6f2]"
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
  const recentItem = allItems[0]

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#191b23]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f4ee]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-bold text-[#0d4237]">
            FoundTrust
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#3f4845] md:flex">
            <a href="#feed" className="hover:text-[#0d4237]">Items</a>
            <a href="#process" className="hover:text-[#0d4237]">Steps</a>
            <a href="#trust" className="hover:text-[#0d4237]">Safety</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="text-sm font-semibold text-[#3f4845] hover:text-[#0d4237]">
              {isAuthenticated ? 'Dashboard' : 'Sign in'}
            </Link>
            <Link to="/lost-items/new" className="inline-flex h-11 items-center justify-center rounded-full bg-[#0d4237] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(13,66,55,0.22)] hover:bg-[#145c4d]">
              Report item
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-[#0d4237] md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileNavOpen ? (
          <div className="border-t border-black/10 bg-[#f7f4ee] px-4 py-4 md:hidden">
            <div className="grid gap-3 text-sm font-semibold text-[#3f4845]">
              <a href="#feed" onClick={() => setMobileNavOpen(false)}>Items</a>
              <a href="#process" onClick={() => setMobileNavOpen(false)}>Steps</a>
              <a href="#trust" onClick={() => setMobileNavOpen(false)}>Safety</a>
              <Link to={isAuthenticated ? '/dashboard' : '/login'}>{isAuthenticated ? 'Dashboard' : 'Sign in'}</Link>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden bg-[#f7f4ee]">
        <div className="relative mx-auto grid max-w-[1280px] gap-10 px-4 pb-12 pt-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-20 lg:pt-20">
          <div className="flex flex-col justify-center">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#cdd8d4] bg-white/70 px-3 py-1 text-sm font-semibold text-[#0d4237] shadow-[0_8px_22px_rgba(38,52,48,0.08)]">
              <ShieldCheck className="h-4 w-4" />
              Smart lost and found
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] text-[#13201c] sm:text-5xl lg:text-6xl">
              Find lost items faster.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-[#4d5753]">
              Report, match, and return belongings with a cleaner community workflow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/lost-items/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0d4237] px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(13,66,55,0.24)] hover:bg-[#145c4d]">
                <PackageSearch className="h-4 w-4" />
                Report lost item
              </Link>
              <a
                href="#feed"
                onClick={() => setFeedType('found')}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#bccac6] bg-white px-6 text-sm font-semibold text-[#0d4237] hover:border-[#0d4237]"
              >
                <Search className="h-4 w-4" />
                Browse items
              </a>
            </div>

            <form
              className="mt-10 grid gap-3 rounded-2xl border border-[#e0d9cb] bg-white p-3 shadow-[0_16px_44px_rgba(39,43,38,0.1)] sm:grid-cols-[1fr_auto_auto]"
              onSubmit={(event) => {
                event.preventDefault()
                document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <label className="flex h-12 items-center gap-3 rounded-xl border border-transparent bg-[#f7f4ee] px-4 focus-within:border-[#0d4237]">
                <Search className="h-4 w-4 text-[#6d7672]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="What did you lose?"
                  className="w-full bg-transparent text-sm text-[#191b23] outline-none placeholder:text-[#6d7672]"
                />
              </label>
              <label className="flex h-12 items-center gap-3 rounded-xl border border-[#e0d9cb] bg-white px-4 text-sm text-[#3f4845]">
                <SlidersHorizontal className="h-4 w-4 text-[#6d7672]" />
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent outline-none">
                  <option>All</option>
                  {categoryNames.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0d4237] px-6 text-sm font-semibold text-white hover:bg-[#145c4d]">
                Search
              </button>
            </form>
          </div>

          <div className="relative min-h-[460px]">
            <div className="absolute inset-x-4 bottom-0 top-8 rounded-[32px] bg-[#13352d]" />
            <div className="absolute right-0 top-0 h-[72%] w-[82%] overflow-hidden rounded-[32px] bg-[#cfe0d8] shadow-[0_24px_60px_rgba(28,38,33,0.24)]">
              {recentItem?.imageUrl ? (
                <img src={recentItem.imageUrl} alt={recentItem.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#dfe7e2]">
                  <img src={heroImage} alt="" className="h-56 w-56 object-contain opacity-95" />
                </div>
              )}
            </div>
            <div className="absolute bottom-8 left-0 max-w-[320px] rounded-2xl border border-white/60 bg-white/90 p-5 shadow-[0_18px_44px_rgba(28,38,33,0.18)] backdrop-blur">
              <p className="text-xs font-semibold uppercase text-[#6d7672]">Latest report</p>
              <h2 className="mt-2 line-clamp-1 text-xl font-semibold text-[#13201c]">{recentItem?.title ?? 'Ready for reports'}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#4d5753]">
                <MapPin className="h-4 w-4 text-[#0d4237]" />
                {recentItem?.location ?? 'Community coverage'}
              </p>
            </div>
            <div className="absolute right-6 top-10 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0d4237] shadow-[0_14px_34px_rgba(28,38,33,0.16)]">
              <Sparkles className="h-4 w-4" />
              {activeReports} active
            </div>
            <div className="absolute bottom-10 right-10 rounded-2xl bg-[#f4c66a] px-5 py-4 text-[#13201c] shadow-[0_16px_36px_rgba(28,38,33,0.18)]">
              <p className="text-2xl font-bold">{returnedCount || 'New'}</p>
              <p className="text-xs font-semibold uppercase">returned</p>
            </div>
          </div>
        </div>
        <div className="mx-auto grid max-w-[1280px] gap-3 px-4 pb-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ['Report', 'Add photo and place'],
            ['Match', 'Spot likely finds'],
            ['Return', 'Close the loop'],
          ].map(([title, label]) => (
            <div key={title} className="rounded-2xl border border-[#e0d9cb] bg-white/70 p-4">
              <p className="font-semibold text-[#13201c]">{title}</p>
              <p className="mt-1 text-sm text-[#5d6762]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="feed" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-[#0d4237]">Live feed</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#13201c]">Recent community reports</h2>
          </div>
          <div className="flex w-fit rounded-full border border-[#d7d0c2] bg-white p-1">
            {(['found', 'lost'] as ItemType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFeedType(type)}
                className={`h-10 rounded-full px-4 text-sm font-semibold capitalize transition ${feedType === type ? 'bg-[#0d4237] text-white' : 'text-[#3f4845] hover:bg-[#f7f4ee]'}`}
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
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold ${category === 'All' ? 'bg-[#0d4237] text-white' : 'border border-[#d7d0c2] bg-white text-[#3f4845]'}`}
          >
            <Filter className="h-3.5 w-3.5" />
            All
          </button>
          {categoryNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={`h-9 rounded-full px-4 text-sm font-semibold transition ${category === name ? 'bg-[#0d4237] text-white' : 'border border-[#d7d0c2] bg-white text-[#3f4845] hover:border-[#0d4237]'}`}
            >
              {name}
            </button>
          ))}
        </div>

        {loadingItems ? (
          <div className="mt-10 flex items-center gap-3 rounded-2xl border border-[#d7d0c2] bg-white p-6 text-[#3f4845]">
            <Loader2 className="h-5 w-5 animate-spin text-[#0d4237]" />
            Loading live reports...
          </div>
        ) : filteredItems.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <LandingItemCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-[#d7d0c2] bg-white p-8 text-center shadow-[0_12px_28px_rgba(39,43,38,0.08)]">
            <Database className="mx-auto h-8 w-8 text-[#0d4237]" />
            <h3 className="mt-4 text-xl font-semibold text-[#13201c]">No matches yet</h3>
          </div>
        )}
      </section>

      <section id="process" className="border-y border-[#e0d9cb] bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-[#13201c]">How it works</h2>
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
                  className={`rounded-2xl border p-6 text-left transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(39,43,38,0.1)] ${selected ? 'border-[#0d4237] bg-[#eef6f2]' : 'border-[#d7d0c2] bg-white'}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0d4237] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-5 text-sm font-semibold text-[#6d7672]">Step {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-[#13201c]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4d5753]">{step.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section id="trust" className="bg-[#13201c] py-16 text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold">Safety built in.</h2>
            <div className="mt-8 grid gap-4">
              <p className="flex gap-3 text-sm text-[#dbe5df]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4c66a] text-[#13201c]">
                  <UserCheck className="h-4 w-4" />
                </span>
                <span><strong className="text-white">Verified meetings.</strong> Safer handoffs.</span>
              </p>
              <p className="flex gap-3 text-sm text-[#dbe5df]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4c66a] text-[#13201c]">
                  <LockKeyhole className="h-4 w-4" />
                </span>
                <span><strong className="text-white">Private claims.</strong> Details stay controlled.</span>
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
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center">
                <p className="text-3xl font-bold text-[#f4c66a]">{value}</p>
                <p className="mt-2 text-xs font-semibold uppercase text-[#dbe5df]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4c66a] py-16 text-[#13201c]">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Start your search now.</h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/lost-items/new" className="inline-flex h-12 items-center justify-center rounded-full bg-[#13201c] px-6 text-sm font-semibold text-white hover:bg-[#0d4237]">
              Report your item
            </Link>
            <a
              href="#feed"
              onClick={() => setFeedType('found')}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#13201c] px-6 text-sm font-semibold text-[#13201c] hover:bg-white/30"
            >
              Search items
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#f7f4ee] py-10">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 text-sm text-[#3f4845] sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Link to="/" className="font-bold text-[#13201c]">FoundTrust</Link>
          </div>
          <div>
            <p className="font-semibold text-[#13201c]">Platform</p>
            <div className="mt-3 grid gap-2">
              <a href="#feed">Items</a>
              <a href="#process">Steps</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#13201c]">Company</p>
            <div className="mt-3 grid gap-2">
              <a href="#trust">Safety</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#13201c]">Legal</p>
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
