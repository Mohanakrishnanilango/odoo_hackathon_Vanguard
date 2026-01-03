'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

interface SidebarProps {
  tripId?: string
  tripName?: string
}

export default function Sidebar({ tripId, tripName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (tripId) {
      if (path.includes('/trips/[id]')) {
        const basePath = `/trips/${tripId}`
        return pathname.startsWith(basePath) && pathname !== basePath
      }
    }
    return pathname === path || pathname.startsWith(path)
  }

  const mainNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/trips', label: 'My Trips', icon: 'flight' },
    { path: '/flights', label: 'Flight Booking', icon: 'flight_takeoff' },
    { path: '/tickets', label: 'My Tickets', icon: 'confirmation_number' },
    { path: '/cities', label: 'Explore Cities', icon: 'explore' },
    { path: '/hotels', label: 'Hotels', icon: 'hotel' },
  ]

  const tripNavItems = tripId
    ? [
        { path: `/trips/${tripId}`, label: 'Overview', icon: 'calendar_view_month' },
        { path: `/trips/${tripId}/itinerary`, label: 'Itinerary', icon: 'event_note' },
        { path: `/trips/${tripId}/flights`, label: 'Flights', icon: 'flight_takeoff' },
        { path: `/trips/${tripId}/budget`, label: 'Budget', icon: 'account_balance_wallet' },
      ]
    : []

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor"></path>
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">GlobeTrotter</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Main Navigation */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
            Main
          </p>
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Trip Navigation */}
        {tripNavItems.length > 0 && (
          <div className="mb-6">
            <div className="px-3 mb-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Trip
              </p>
              {tripName && (
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={tripName}>
                  {tripName}
                </p>
              )}
            </div>
            {tripNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
            Quick Actions
          </p>
          <Link
            href="/trips/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-1"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            New Trip
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-1"
          >
            <span className="material-symbols-outlined text-xl">person</span>
            Profile
          </Link>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {session?.user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {session?.user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

