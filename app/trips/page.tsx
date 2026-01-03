'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'

interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
  description?: string
  coverPhoto?: string
  _count: {
    stops: number
  }
}

type TabType = 'upcoming' | 'completed' | 'drafts'

export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips')
      const data = await response.json()
      setTrips(data.trips || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    const tripDate = new Date(dateString)
    const diffTime = tripDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const isCompleted = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const filteredTrips = trips.filter(trip => {
    if (activeTab === 'completed') return isCompleted(trip.endDate)
    if (activeTab === 'upcoming') return !isCompleted(trip.endDate)
    return false // drafts - you can add logic here
  })

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
          ></motion.div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <main className="flex-1 px-4 py-8 md:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Page Heading */}
          <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                My Trips
              </h1>
              <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                Manage your upcoming adventures and past memories.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/trips/new')}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Create New Trip</span>
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`border-b-[3px] pb-3 text-sm font-bold transition-colors ${
                  activeTab === 'upcoming'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`border-b-[3px] pb-3 text-sm font-bold transition-colors ${
                  activeTab === 'completed'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`border-b-[3px] pb-3 text-sm font-bold transition-colors flex items-center gap-2 ${
                  activeTab === 'drafts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Drafts
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  0
                </span>
              </button>
            </div>
          </div>

          {/* Grid Layout for Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {filteredTrips.length === 0 ? (
              <div className="col-span-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800"
                >
                  <div className="text-6xl mb-4">✈️</div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    No {activeTab === 'upcoming' ? 'upcoming' : activeTab === 'completed' ? 'completed' : 'draft'} trips yet
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/trips/new')}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Create New Trip
                  </motion.button>
                </motion.div>
              </div>
            ) : (
              filteredTrips.map((trip, index) => {
                const daysUntil = getDaysUntil(trip.startDate)
                const completed = isCompleted(trip.endDate)
                const isDraft = false // Add your draft logic here

                return (
                  <motion.article
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-slate-900 dark:shadow-slate-900/50"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      {trip.coverPhoto ? (
                        <Image
                          src={trip.coverPhoto}
                          alt={trip.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                      <div className="absolute right-3 top-3">
                        <button className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/40">
                          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <span className="inline-flex items-center rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-sm dark:bg-black/80 dark:text-white">
                          <span className="material-symbols-outlined mr-1 text-[14px]">map</span>
                          {trip._count.stops} {trip._count.stops === 1 ? 'Destination' : 'Destinations'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            completed
                              ? 'text-slate-400'
                              : isDraft
                              ? 'text-slate-400 dark:text-slate-500'
                              : 'text-primary'
                          }`}
                        >
                          {completed
                            ? formatDate(trip.endDate)
                            : isDraft
                            ? 'Planning Phase'
                            : daysUntil > 0
                            ? `In ${daysUntil} ${daysUntil === 1 ? 'Day' : 'Days'}`
                            : 'Today'}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs font-medium ${
                            completed
                              ? 'text-slate-500'
                              : isDraft
                              ? 'text-amber-500'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              completed
                                ? 'bg-slate-400'
                                : isDraft
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          ></span>
                          {completed ? 'Completed' : isDraft ? 'Draft' : 'Confirmed'}
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{trip.name}</h3>
                      <p className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)} •{' '}
                        {Math.ceil(
                          (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </p>
                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                        {!completed && !isDraft && (
                          <div className="flex -space-x-2">
                            <div className="size-7 rounded-full border-2 border-white bg-slate-200 dark:border-slate-700"></div>
                            <div className="size-7 rounded-full border-2 border-white bg-slate-200 dark:border-slate-700"></div>
                          </div>
                        )}
                        {completed && (
                          <div className="text-xs text-slate-400 font-medium">Shared with 1 person</div>
                        )}
                        {isDraft && (
                          <div className="text-xs text-slate-400 font-medium">Last edited 2 days ago</div>
                        )}
                        <button
                          onClick={() => router.push(`/trips/${trip.id}`)}
                          className="flex items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-blue-700 dark:hover:text-blue-400"
                        >
                          {completed ? 'View Memories' : isDraft ? 'Continue Planning' : 'View Itinerary'}
                          <span className="material-symbols-outlined text-[16px]">
                            {completed ? 'photo_library' : isDraft ? 'edit' : 'arrow_forward'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                )
              })
            )}

            {/* Add New Card */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/trips/new')}
              className="group relative flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-all hover:border-primary hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-primary dark:hover:bg-slate-800"
            >
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-700 dark:ring-slate-600 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl text-primary">add_location_alt</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Explore somewhere new</h3>
              <p className="mt-2 max-w-[200px] text-sm text-slate-500 dark:text-slate-400">
                Start planning your next adventure from scratch.
              </p>
              <span className="mt-6 inline-flex items-center text-sm font-bold text-primary group-hover:underline">
                Start Planning
              </span>
            </motion.button>
          </div>

          {/* Pagination / Loading Area */}
          {filteredTrips.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                Load more trips
              </button>
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}
