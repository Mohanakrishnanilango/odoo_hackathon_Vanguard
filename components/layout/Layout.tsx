'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  // All hooks must be called at the top level, before any conditional returns
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [tripName, setTripName] = useState<string | undefined>(undefined)
  
  // Extract tripId from pathname if on trip pages
  const tripIdMatch = pathname?.match(/\/trips\/([^/]+)/)
  const tripId = tripIdMatch ? tripIdMatch[1] : undefined

  // Don't redirect on auth pages
  const isAuthPage = pathname?.startsWith('/auth')

  useEffect(() => {
    if (!isAuthPage && status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router, isAuthPage])

  useEffect(() => {
    if (tripId && !isAuthPage) {
      fetch(`/api/trips/${tripId}`)
        .then(res => res.json())
        .then(data => {
          if (data.trip) {
            setTripName(data.trip.name)
          }
        })
        .catch(() => {})
    } else {
      setTripName(undefined)
    }
  }, [tripId, isAuthPage])

  // Conditional returns after all hooks
  if (isAuthPage) {
    return <>{children}</>
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar tripId={tripId} tripName={tripName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
