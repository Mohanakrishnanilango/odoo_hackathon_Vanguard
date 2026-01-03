'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import { formatCurrency } from '@/lib/currency'

interface Activity {
  id: string
  name: string
  description?: string
  category: string
  cost: number
  duration: number
  rating?: number
  imageUrl?: string
  city: {
    id: string
    name: string
  }
}

interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
}

interface ItineraryDay {
  id: string
  date: string
  activities: Activity[]
}

export default function ActivitiesPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string
  const stopId = params.stopId as string
  const [activities, setActivities] = useState<Activity[]>([])
  const [stopActivities, setStopActivities] = useState<Activity[]>([])
  const [cityId, setCityId] = useState<string>('')
  const [cityName, setCityName] = useState<string>('')
  const [trip, setTrip] = useState<Trip | null>(null)
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [durationFilter, setDurationFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [freeCancellation, setFreeCancellation] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStopInfo()
    fetchTripInfo()
  }, [stopId, tripId])

  const fetchStopInfo = async () => {
    try {
      const stopsResponse = await fetch(`/api/trips/${tripId}/stops`)
      const stopsData = await stopsResponse.json()
      const stop = stopsData.stops.find((s: any) => s.id === stopId)
      if (stop) {
        setCityId(stop.city.id)
        setCityName(stop.city.name)
        setStopActivities(stop.activities || [])
        fetchActivities(stop.city.id)
      }
    } catch (error) {
      console.error('Error fetching stop info:', error)
      setLoading(false)
    }
  }

  const fetchTripInfo = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      const data = await response.json()
      setTrip(data.trip)
      // Fetch itinerary days
      fetchItineraryDays()
    } catch (error) {
      console.error('Error fetching trip info:', error)
    }
  }

  const fetchItineraryDays = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary`)
      const data = await response.json()
      setItineraryDays(data.days || [])
    } catch (error) {
      console.error('Error fetching itinerary days:', error)
    }
  }

  const fetchActivities = async (cityId: string) => {
    try {
      const response = await fetch(`/api/activities?cityId=${cityId}&limit=50`)
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStopActivities = async () => {
    try {
      const stopsResponse = await fetch(`/api/trips/${tripId}/stops`)
      const stopsData = await stopsResponse.json()
      const stop = stopsData.stops.find((s: any) => s.id === stopId)
      if (stop) {
        setStopActivities(stop.activities || [])
      }
    } catch (error) {
      console.error('Error fetching stop activities:', error)
    }
  }

  const handleAddActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          stopId,
        }),
      })

      if (response.ok) {
        fetchStopActivities()
        fetchItineraryDays()
      }
    } catch (error) {
      console.error('Error adding activity:', error)
    }
  }

  const handleRemoveActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/activities?activityId=${activityId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchStopActivities()
        fetchItineraryDays()
      }
    } catch (error) {
      console.error('Error removing activity:', error)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchQuery || 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || activity.category === categoryFilter
    // Convert INR thresholds to USD for filtering (50 USD = ~4150 INR, 100 USD = ~8300 INR)
    const matchesPrice = !priceFilter || (
      priceFilter === 'Free' ? activity.cost === 0 :
      priceFilter === 'Under ₹4,000' ? activity.cost < 50 :
      priceFilter === '₹4,000-₹8,000' ? activity.cost >= 50 && activity.cost <= 100 :
      activity.cost > 100
    )
    const matchesRating = !ratingFilter || (activity.rating || 0) >= parseFloat(ratingFilter)
    return matchesSearch && matchesCategory && matchesPrice && matchesRating
  })

  const categories = ['SIGHTSEEING', 'FOOD', 'ADVENTURE', 'CULTURE', 'NIGHTLIFE', 'SHOPPING', 'NATURE', 'SPORTS', 'RELAXATION', 'OTHER']

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const totalBudget = stopActivities.reduce((sum, a) => sum + a.cost, 0)
  const budgetLimit = 300

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
    <div className="flex flex-1 overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Left Content: Browsing Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-4 items-end">
            <div className="flex flex-col gap-2">
              <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Explore Experiences in {cityName}
              </h1>
              <p className="text-text-secondary dark:text-slate-400 text-base font-normal leading-normal">
                Find and book activities for your upcoming trip to {cityName}.
              </p>
            </div>
            {trip && (
              <div className="hidden md:block">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>
            )}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col gap-4 sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm py-2">
            {/* Search Bar */}
            <div className="w-full">
              <label className="flex flex-col w-full h-12">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full shadow-sm">
                  <div className="text-text-secondary dark:text-slate-400 flex border-none bg-white dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-none bg-white dark:bg-slate-800 text-text-main dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 h-full placeholder:text-text-secondary dark:placeholder:text-slate-500 px-4 text-base font-normal leading-normal transition-all"
                    placeholder={`Search activities, tours, or landmarks in ${cityName}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Chips / Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setCategoryFilter(categoryFilter ? '' : 'SIGHTSEEING')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-4 pr-3 shadow-sm transition-all group ${
                  categoryFilter
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary'
                }`}
              >
                <p className={`text-sm font-medium leading-normal group-hover:text-primary ${categoryFilter ? 'text-white' : 'text-text-main dark:text-slate-200'}`}>
                  Activity Type
                </p>
                <span className={`material-symbols-outlined text-lg ${categoryFilter ? 'text-white' : 'text-text-main dark:text-slate-200'}`}>
                  expand_more
                </span>
              </button>
              <button
                onClick={() => setPriceFilter(priceFilter === 'Free' ? 'Under ₹4,000' : priceFilter === 'Under ₹4,000' ? '₹4,000-₹8,000' : priceFilter === '₹4,000-₹8,000' ? 'Over ₹8,000' : 'Free')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-4 pr-3 shadow-sm transition-all group ${
                  priceFilter
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary'
                }`}
              >
                <p className={`text-sm font-medium leading-normal group-hover:text-primary ${priceFilter ? 'text-white' : 'text-text-main dark:text-slate-200'}`}>
                  {priceFilter || 'Price Range'}
                </p>
                <span className={`material-symbols-outlined text-lg ${priceFilter ? 'text-white' : 'text-text-main dark:text-slate-200'}`}>
                  expand_more
                </span>
              </button>
              <button
                onClick={() => setDurationFilter(durationFilter === '1h' ? '2h' : durationFilter === '2h' ? '4h' : durationFilter === '4h' ? 'Full Day' : durationFilter === 'Full Day' ? '' : '1h')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-4 pr-3 shadow-sm transition-all group ${
                  durationFilter
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary'
                }`}
              >
                <p className={`text-sm font-medium leading-normal group-hover:text-primary ${durationFilter ? 'text-white' : 'text-text-main dark:text-slate-200'}`}>
                  Duration
                </p>
                <span className={`material-symbols-outlined text-lg ${durationFilter ? 'text-white' : 'text-text-main dark:text-slate-200'}`}>
                  expand_more
                </span>
              </button>
              <button
                onClick={() => setRatingFilter(ratingFilter === '4.5' ? '4.0' : ratingFilter === '4.0' ? '' : '4.5')}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-4 pr-3 shadow-sm transition-all group ${
                  ratingFilter
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary'
                }`}
              >
                <p className={`text-sm font-medium leading-normal group-hover:text-primary ${ratingFilter ? 'text-white' : 'text-text-main dark:text-slate-200'}`}>
                  Rating
                </p>
                <span className={`material-symbols-outlined text-lg ${ratingFilter ? 'text-white' : 'text-text-main dark:text-slate-200'}`}>
                  expand_more
                </span>
              </button>
              <button
                onClick={() => setFreeCancellation(!freeCancellation)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-3 shadow-sm transition-all ${
                  freeCancellation
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-text-main dark:text-slate-200'
                }`}
              >
                <p className="text-sm font-medium leading-normal">Free Cancellation</p>
                {freeCancellation && (
                  <span className="material-symbols-outlined text-lg">check</span>
                )}
              </button>
            </div>
          </div>

          {/* Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredActivities.map((activity, index) => {
              const isAdded = stopActivities.some(a => a.id === activity.id)
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group flex flex-col rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    {activity.imageUrl ? (
                      <Image
                        src={activity.imageUrl}
                        alt={activity.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://source.unsplash.com/800x600/?${encodeURIComponent(activity.name)}`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600"></div>
                    )}
                    {activity.rating && activity.rating >= 4.8 && (
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-text-main dark:text-white uppercase tracking-wider">
                        Top Rated
                      </div>
                    )}
                    <button className="absolute top-3 right-3 p-2 bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-xl">favorite</span>
                    </button>
                    {/* Quick View overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Quick View
                      </button>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                        {activity.name}
                      </h3>
                      {activity.rating && (
                        <div className="flex items-center gap-1 text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                          <span className="material-symbols-outlined text-sm filled">star</span>
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                            {activity.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {activity.duration} {activity.duration === 1 ? 'hour' : 'hours'}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">attach_money</span>
                        {activity.cost === 0 ? 'Free' : `From ${formatCurrency(activity.cost, 'INR')}`}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {activity.description || `Experience ${activity.name} in ${cityName}.`}
                    </p>
                    <div className="mt-auto pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => isAdded ? handleRemoveActivity(activity.id) : handleAddActivity(activity.id)}
                        disabled={isAdded}
                        className={`w-full flex items-center justify-center gap-2 h-10 rounded-lg font-bold text-sm transition-all shadow-sm ${
                          isAdded
                            ? 'bg-green-600 text-white cursor-default'
                            : 'bg-primary hover:bg-blue-600 text-white shadow-blue-200 dark:shadow-none'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isAdded ? 'check' : 'add'}
                        </span>
                        {isAdded ? 'Added to Day 2' : 'Add to Itinerary'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="flex justify-center py-6">
            <button className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
              Show more activities <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Itinerary Context */}
      <aside className="w-96 shrink-0 hidden lg:flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xl text-text-main dark:text-white">My Trip</h3>
            <button
              onClick={() => router.push(`/trips/${tripId}/itinerary`)}
              className="text-primary text-sm font-medium hover:underline"
            >
              Edit Trip
            </button>
          </div>
          {trip && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-base">calendar_today</span>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)} • 2 Guests
            </div>
          )}
          {/* Progress/Budget Widget */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">
              <span>Activities Budget</span>
              <span>{formatCurrency(totalBudget, 'INR')} / {formatCurrency(budgetLimit, 'INR')}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min((totalBudget / budgetLimit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {itineraryDays.slice(0, 3).map((day, dayIndex) => (
            <div key={day.id} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
              <div className={`absolute -left-[9px] top-0 size-4 rounded-full border-4 border-white dark:border-slate-900 ${
                dayIndex === 0 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
              }`}></div>
              <div className="mb-3">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Day {dayIndex + 1} - {formatDate(day.date)}
                </h4>
                <p className="text-xs text-slate-500">
                  {dayIndex === 0 ? 'Arrival & Check-in' : dayIndex === 1 ? 'Nature & Heritage' : 'Food & Culture'}
                </p>
              </div>
              {day.activities.length === 0 ? (
                <div className="p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 text-sm gap-2 bg-slate-50/50 dark:bg-slate-800/50">
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Drop {dayIndex === 0 ? 'morning' : 'activity'} here
                </div>
              ) : (
                <div className="space-y-3">
                  {day.activities.slice(0, 2).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm group hover:border-primary/50 transition-colors cursor-move"
                    >
                      {activity.imageUrl ? (
                        <div
                          className="w-12 h-12 shrink-0 rounded bg-slate-200 bg-cover bg-center"
                          style={{ backgroundImage: `url(${activity.imageUrl})` }}
                        ></div>
                      ) : (
                        <div className="w-12 h-12 shrink-0 rounded bg-slate-200"></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {activity.name}
                          </p>
                          <button
                            onClick={() => handleRemoveActivity(activity.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">
                          {activity.duration}h • {formatCurrency(activity.cost, 'INR')}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                            Booked
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className="mt-auto p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/trips/${tripId}/itinerary`)}
            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
          >
            View Full Itinerary
          </motion.button>
        </div>
      </aside>
    </div>
  )
}
