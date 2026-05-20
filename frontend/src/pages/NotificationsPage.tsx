import { useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BellRing, Sparkles, User, Mail, Phone, ArrowUpRight, FileText } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { fetchNotifications, markAllNotificationsAsRead } from '../lib/apiData'
import type { AppNotification } from '../types/models'

function parseMatchMessage(message: string) {
  const regex = /A potential match has been found for your lost item '([^']+)'. Description: '([^']+)'. Contact the finder: ([^(]+) \(([^,)]+)(?:,\s*([^)]+))?\)\./
  const match = message.match(regex)
  if (match) {
    return {
      lostItemTitle: match[1],
      foundItemDescription: match[2],
      finderName: match[3].trim(),
      finderEmail: match[4].trim(),
      finderPhone: match[5] ? match[5].trim() : undefined,
    }
  }
  return null
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  useEffect(() => {
    const hasUnread = notifications.some((n) => !n.read)
    if (hasUnread) {
      markAllReadMutation.mutate()
    }
  }, [notifications])

  if (isLoading) return <LoadingState message="Loading notifications..." />
  if (isError) return <ErrorState description="Unable to load notifications from the API." />

  const renderNotificationCard = (notification: AppNotification) => {
    const isMatch = notification.type === 'match'
    const isClaim = notification.type === 'claim'

    if (isMatch) {
      const parsed = parseMatchMessage(notification.message)
      const lostItemTitle = notification.data?.lost_item_title ?? parsed?.lostItemTitle ?? 'Your Lost Item'
      const foundItemDescription = notification.data?.found_item_description ?? parsed?.foundItemDescription ?? ''
      const finderName = notification.data?.finder_name ?? parsed?.finderName ?? 'Finder'
      const finderEmail = notification.data?.finder_email ?? parsed?.finderEmail ?? ''
      const finderPhone = notification.data?.finder_phone ?? parsed?.finderPhone ?? ''
      const matchScore = notification.data?.match_score ? Math.round(Number(notification.data.match_score) * 100) : undefined

      return (
        <article key={notification.id} className={`rounded-2xl border p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] ${notification.read ? 'border-[#e2e1ed] bg-white' : 'border-[#82f5c1] bg-[#f0fff7]'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3f4f6] pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e0f2fe] text-[#0369a1]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold text-[#191b23] text-base">{notification.title}</h2>
                <p className="text-xs text-[#737686]">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {matchScore !== undefined && (
                <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-semibold text-[#0369a1]">{matchScore}% Match</span>
              )}
              {!notification.read && (
                <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" title="Unread" />
              )}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Matched Lost Item</p>
              <p className="mt-1 font-semibold text-[#191b23] text-base">{lostItemTitle}</p>
            </div>

            {foundItemDescription && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Found Item Description</p>
                <p className="mt-1 text-sm text-[#434654] italic">"{foundItemDescription}"</p>
              </div>
            )}

            <div className="rounded-xl border border-[#e2e1ed] bg-[#fafafa] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#003fb1] mb-3 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Finder's Contact Details
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-[#434654]">
                  <span className="text-[#737686] font-medium">Name:</span>
                  <span className="font-semibold text-[#191b23]">{finderName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#434654]">
                  <Mail className="h-4 w-4 text-[#737686]" />
                  <a href={`mailto:${finderEmail}`} className="font-medium text-[#003fb1] hover:underline flex items-center gap-1">
                    {finderEmail} <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#434654] sm:col-span-2 border-t border-[#e2e1ed] pt-2.5 mt-1">
                  <Phone className="h-4 w-4 text-[#737686]" />
                  <span className="text-[#737686] font-medium">Phone number:</span>
                  {finderPhone ? (
                    <a href={`tel:${finderPhone}`} className="font-bold text-[#10b981] hover:underline flex items-center gap-1">
                      {finderPhone} <ArrowUpRight className="h-3 w-3" />
                  </a>
                  ) : (
                    <span className="text-sm italic text-[#88889b]">Not provided by finder</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-3 border-t border-[#f3f4f6]">
            <Link
              to="/matches"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e1ed] bg-white px-4 py-2 text-xs font-semibold text-[#434654] transition hover:bg-[#fafafa]"
            >
              Go to Matches
            </Link>
            <a
              href={`mailto:${finderEmail}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003fb1] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1a56db]"
            >
              Email Finder
            </a>
          </div>
        </article>
      )
    }

    if (isClaim) {
      return (
        <article key={notification.id} className={`rounded-2xl border p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] ${notification.read ? 'border-[#e2e1ed] bg-white' : 'border-[#82f5c1] bg-[#f0fff7]'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3f4f6] pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fef3c7] text-[#d97706]">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold text-[#191b23] text-base">{notification.title}</h2>
                <p className="text-xs text-[#737686]">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
            {!notification.read && (
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" title="Unread" />
            )}
          </div>

          <p className="mt-4 text-sm leading-6 text-[#434654]">{notification.message}</p>

          <div className="mt-4 flex justify-end gap-3 pt-3 border-t border-[#f3f4f6]">
            <Link
              to="/claims"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003fb1] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1a56db]"
            >
              Go to Claims
            </Link>
          </div>
        </article>
      )
    }

    return (
      <article key={notification.id} className={`rounded-2xl border p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] ${notification.read ? 'border-[#e2e1ed] bg-white' : 'border-[#82f5c1] bg-[#f0fff7]'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3f4f6] pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f4f6] text-[#4b5563]">
              <BellRing className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-bold text-[#191b23] text-base">{notification.title}</h2>
              <p className="text-xs text-[#737686]">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
          {!notification.read && (
            <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" title="Unread" />
          )}
        </div>

        <p className="mt-4 text-sm leading-6 text-[#434654]">{notification.message}</p>
      </article>
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#e2e1ed] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#003fb1]">
          <BellRing className="h-4 w-4" />
          System activity
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#191b23]">Notifications</h1>
        <p className="mt-2 text-[#434654]">Read match updates, claim updates, and system notices.</p>
      </div>
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(renderNotificationCard)
        ) : (
          <EmptyState title="No notifications" description="New updates will appear here." />
        )}
      </div>
    </section>
  )
}
