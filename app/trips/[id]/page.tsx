'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import Map from '@/components/Map'

interface Trip {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  budget: number
  coverPhoto?: string
  stops: Array<{
    id: string
    city: {
      id: string
      name: string
      country: string
      latitude?: number
      longitude?: number
    }
    arrivalDate: string
    departureDate: string
    activities: Array<{
      id: string
      name: string
      cost: number
      duration: number
      category: string
    }>
  }>
}

interface ItineraryDay {
  id: string
  date: string
  dayNumber: number
  activities: Array<{
    id: string
    name: string
    time?: string
    cost: number
    duration: number
    category: string
    type: 'flight' | 'hotel' | 'activity' | 'meal'
  }>
}

export default function TripDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string
  const [trip, setTrip] = useState<Trip | null>(null)
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  useEffect(() => {
    fetchTrip()
    fetchItinerary()
  }, [tripId])

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      const data = await response.json()
      setTrip(data.trip)
    } catch (error) {
      console.error('Error fetching trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchItinerary = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary`)
      const data = await response.json()
      setItineraryDays(data.days || [])
    } catch (error) {
      console.error('Error fetching itinerary:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getDayName = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' })
  }

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) days.push(day)
    return days
  }

  const isInTripRange = (day: number, month: number, year: number) => {
    if (!trip) return false
    const date = new Date(year, month, day)
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    return date >= start && date <= end
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return 'flight_land'
      case 'hotel':
        return 'hotel'
      case 'meal':
        return 'restaurant'
      default:
        return 'local_activity'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'flight':
        return 'bg-blue-100 dark:bg-blue-900/30 text-primary'
      case 'hotel':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
      case 'meal':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
      default:
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-600'
    }
  }

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

  if (!trip) {
    return (
      <Layout>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400">Trip not found</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/trips')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold"
          >
            Back to Trips
          </motion.button>
        </div>
      </Layout>
    )
  }

  const startDate = new Date(trip.startDate)
  const currentMonth = startDate.getMonth()
  const currentYear = startDate.getFullYear()
  const monthDays = generateCalendarDays(currentYear, currentMonth)

  return (
    <div className="flex justify-center w-full px-4 py-8">
      <div className="w-full max-w-[1280px] flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar (Sticky) */}
        <aside className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-24 flex flex-col gap-6">
          {/* Trip Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            {/* Title & Meta */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-text-main dark:text-white tracking-tight text-2xl font-bold leading-tight">
                  {trip.name}
                </h2>
                <p className="text-text-secondary text-sm font-medium leading-normal mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
              </div>
              <button className="text-text-secondary hover:text-primary p-1 rounded-full hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
            {/* Budget Tracker */}
            <div className="flex flex-col gap-3 pt-6 pb-2">
              <div className="flex gap-6 justify-between items-end">
                <p className="text-text-main dark:text-white text-sm font-semibold leading-normal">Budget Tracker</p>
                <p className="text-text-secondary text-xs font-medium leading-normal">
                  <span className="text-text-main dark:text-white font-bold">$3,250</span> / ${trip.budget.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-border-light dark:bg-border-dark overflow-hidden h-2">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min((3250 / trip.budget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Calendar Widget */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-2 mb-2">
              <button className="size-8 flex items-center justify-center rounded-full hover:bg-background-light dark:hover:bg-background-dark text-text-main dark:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <p className="text-text-main dark:text-white text-base font-bold leading-tight">
                {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <button className="size-8 flex items-center justify-center rounded-full hover:bg-background-light dark:hover:bg-background-dark text-text-main dark:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-text-secondary py-1">
                  {day}
                </div>
              ))}
              {monthDays.map((day, index) => {
                if (day === null) return <div key={index}></div>
                const inRange = isInTripRange(day, currentMonth, currentYear)
                const isStart = new Date(currentYear, currentMonth, day).getTime() === new Date(trip.startDate).getTime()
                const isEnd = new Date(currentYear, currentMonth, day).getTime() === new Date(trip.endDate).getTime()
                return (
                  <button
                    key={index}
                    className={`h-9 w-full flex items-center justify-center text-sm font-medium rounded-full transition-colors ${
                      isStart || isEnd
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : inRange
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-main dark:text-white hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Map Widget */}
          {trip && trip.stops.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Route Map</h3>
              <Map
                markers={trip.stops.map((stop, index) => ({
                  id: stop.id,
                  name: stop.city.name,
                  lat: stop.city.latitude || 0,
                  lng: stop.city.longitude || 0,
                  order: index + 1,
                }))}
                route={true}
                height="200px"
              />
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-text-main dark:text-white border border-border-light dark:border-border-dark font-bold h-12 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export
            </motion.button>
          </div>
        </aside>

        {/* Main Timeline Content */}
        <main className="flex-1 w-full min-w-0 flex flex-col gap-8 pb-20">
          {/* Header Actions for Timeline */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-background-light dark:bg-background-dark text-text-main dark:text-white'
                    : 'bg-transparent text-text-secondary hover:text-primary'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-background-light dark:bg-background-dark text-text-main dark:text-white'
                    : 'bg-transparent text-text-secondary hover:text-primary'
                }`}
              >
                Map View
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/trips/${tripId}/itinerary`)}
              className="flex items-center gap-2 text-primary font-bold text-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Add Day
            </motion.button>
          </div>

          {/* Timeline Days */}
          {itineraryDays.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800"
            >
              <div className="text-6xl mb-4">📅</div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">No itinerary days planned yet</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/trips/${tripId}/itinerary`)}
                className="px-6 py-3 bg-primary text-white rounded-lg font-bold"
              >
                Create Itinerary
              </motion.button>
            </motion.div>
          ) : (
            itineraryDays.map((day, dayIndex) => (
              <section key={day.id} className="flex flex-col gap-4 relative">
                {/* Day Header */}
                <div className="sticky top-[72px] lg:top-4 z-40 flex items-center justify-between bg-white dark:bg-slate-900/95 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${dayIndex === 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                      <span className="material-symbols-outlined">calendar_today</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-main dark:text-white">
                        Day {day.dayNumber} - {getDayName(day.date)}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {formatDate(day.date)} • {day.activities.length} {day.activities.length === 1 ? 'Activity' : 'Activities'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-text-secondary text-sm bg-background-light dark:bg-background-dark px-3 py-1.5 rounded-full">
                      <span className="material-symbols-outlined text-[18px]">partly_cloudy_day</span>
                      <span>28°C</span>
                    </div>
                    <button className="size-8 flex items-center justify-center rounded-full hover:bg-background-light dark:hover:bg-background-dark text-text-secondary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </div>

                <div className="relative pl-4 lg:pl-0 flex flex-col gap-4">
                  {/* Connector Line */}
                  <div className="timeline-connector active hidden lg:block left-[3.5rem]"></div>

                  {day.activities.length === 0 ? (
                    <div className="flex gap-4 group mt-2">
                      <div className="hidden lg:flex w-24 shrink-0"></div>
                      <div className="hidden lg:flex flex-col items-center relative z-10">
                        <div className="w-0.5 h-full bg-border-light dark:bg-border-dark"></div>
                      </div>
                      <div className="flex-1 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 flex flex-col items-center justify-center text-center gap-2">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">explore</span>
                        </div>
                        <p className="text-text-main dark:text-white font-medium text-sm">You have free time here!</p>
                        <button
                          onClick={() => router.push(`/trips/${tripId}/stops/${trip.stops[0]?.id}/activities`)}
                          className="text-primary text-sm font-bold hover:underline"
                        >
                          Explore things to do in {trip.stops[0]?.city.name || 'this city'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    day.activities.map((activity, actIndex) => (
                      <div key={activity.id} className="flex gap-4 group">
                        {/* Time Column */}
                        <div className="hidden lg:flex flex-col items-end w-24 pt-4 shrink-0 relative z-10">
                          {activity.time && (
                            <>
                              <span className="text-sm font-bold text-text-main dark:text-white">
                                {activity.time}
                              </span>
                              <span className="text-xs font-medium text-text-secondary">
                                Duration: {activity.duration}h
                              </span>
                            </>
                          )}
                        </div>
                        {/* Icon Node */}
                        <div className="hidden lg:flex flex-col items-center pt-4 relative z-10">
                          <div className="size-4 bg-primary rounded-full ring-4 ring-white dark:ring-background-dark"></div>
                        </div>
                        {/* Card */}
                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row h-full">
                            {activity.type === 'hotel' && activity.imageUrl && (
                              <div className="w-full sm:w-48 h-32 sm:h-auto bg-cover bg-center relative">
                                <Image
                                  src={activity.imageUrl}
                                  alt={activity.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                                  <span className="material-symbols-outlined text-[14px] text-yellow-500 fill-current">star</span>
                                  4.8
                                </div>
                              </div>
                            )}
                            <div className="flex-1 p-5 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                                    <span className="material-symbols-outlined">{getActivityIcon(activity.type)}</span>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-text-main dark:text-white text-base">
                                      {activity.name}
                                    </h4>
                                    {activity.type === 'flight' && (
                                      <p className="text-xs text-text-secondary">Japan Airlines • JL 005</p>
                                    )}
                                    {activity.type === 'hotel' && (
                                      <p className="text-xs text-text-secondary">Check-in: 3:00 PM</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-900">
                                    Confirmed
                                  </span>
                                  <span className="material-symbols-outlined text-text-secondary cursor-grab active:cursor-grabbing">
                                    drag_indicator
                                  </span>
                                </div>
                              </div>
                              {activity.type === 'flight' && (
                                <div className="flex flex-wrap gap-y-4 gap-x-8 mt-1 p-4 bg-background-light dark:bg-background-dark rounded-lg border border-slate-200 dark:border-slate-800 border-dashed">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Departure</span>
                                    <span className="text-sm font-bold text-text-main dark:text-white">08:30 AM</span>
                                    <span className="text-xs text-text-secondary">JFK New York</span>
                                  </div>
                                  <div className="flex-1 flex items-center justify-center min-w-[100px]">
                                    <div className="h-[1px] bg-border-light dark:border-border-dark flex-1 relative">
                                      <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-text-secondary text-[16px] bg-background-light dark:bg-background-dark px-1">
                                        flight_takeoff
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Arrival</span>
                                    <span className="text-sm font-bold text-text-main dark:text-white">11:30 PM</span>
                                    <span className="text-xs text-text-secondary">NRT Tokyo</span>
                                  </div>
                                </div>
                              )}
                              {activity.type === 'hotel' && (
                                <div className="flex justify-between items-end mt-4">
                                  <div className="flex gap-4">
                                    <div className="text-xs text-text-secondary">
                                      <span className="block font-bold text-text-main dark:text-white">1 Room</span>
                                      Double Bed
                                    </div>
                                    <div className="text-xs text-text-secondary">
                                      <span className="block font-bold text-text-main dark:text-white">3 Nights</span>
                                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                    </div>
                                  </div>
                                  <button className="text-sm text-primary font-bold hover:underline">View Booking</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add Item Slot */}
                  <div className="flex gap-4 group opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                    <div className="hidden lg:flex w-24 shrink-0"></div>
                    <div className="hidden lg:flex flex-col items-center relative z-10">
                      <div className="w-0.5 h-full bg-border-light dark:bg-border-dark"></div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/trips/${tripId}/stops/${trip.stops[0]?.id}/activities`)}
                      className="flex-1 h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 text-text-secondary hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <span className="material-symbols-outlined">add</span>
                      <span>Add activity to this slot</span>
                    </motion.button>
                  </div>
                </div>
              </section>
            ))
          )}
        </main>
      </div>
    </div>
  )
}
