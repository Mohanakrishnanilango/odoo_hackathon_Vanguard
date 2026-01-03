'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import Map from '@/components/Map'
import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete'
import GoogleMap from '@/components/GoogleMap'
import CarRentalCard from '@/components/CarRentalCard'
import CarRentalModal, { BookingData } from '@/components/CarRentalModal'
import { EXCHANGE_RATE } from '@/lib/currency'
import CarRentalList from '@/components/CarRentalList'

interface BudgetData {
  totalBudget: number
  totalEstimated: number
  totalExpenses: number
  costPerDay: number
  days: number
  breakdown: {
    transport: number
    accommodation: number
    activities: number
    meals: number
    other: number
  }
  overBudget: boolean
  remaining: number
}

interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
}

export default function BudgetPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string
  const [budget, setBudget] = useState<BudgetData | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Car rental states
  const [showCarRental, setShowCarRental] = useState(false)
  const [availableCars, setAvailableCars] = useState<any[]>([])
  const [selectedCar, setSelectedCar] = useState<any>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [carRentals, setCarRentals] = useState<any[]>([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const [currency] = useState<'USD' | 'INR'>('INR')
  const [exchangeRate] = useState(EXCHANGE_RATE)

  useEffect(() => {
    fetchBudget()
    fetchTrip()
    fetchCarRentals()
  }, [tripId])

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      const data = await response.json()
      setTrip(data.trip)
    } catch (error) {
      console.error('Error fetching trip:', error)
    }
  }

  const fetchBudget = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/budget`)
      const data = await response.json()
      setBudget(data.budget)
    } catch (error) {
      console.error('Error fetching budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCarRentals = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/car-rentals`)
      const data = await response.json()
      setCarRentals(data.rentals || [])
    } catch (error) {
      console.error('Error fetching car rentals:', error)
    }
  }

  const fetchAvailableCars = async () => {
    try {
      const response = await fetch('/api/car-rentals')
      const data = await response.json()
      setAvailableCars(data.cars || [])
    } catch (error) {
      console.error('Error fetching available cars:', error)
    }
  }

  const handleBookCar = async (bookingData: BookingData) => {
    setBookingLoading(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/car-rentals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      
      if (response.ok) {
        const data = await response.json()
        setShowBookingModal(false)
        setSelectedCar(null)
        fetchCarRentals()
        fetchBudget() // Refresh budget to include car rental cost
        alert('Car rental booked successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to book car rental')
      }
    } catch (error) {
      console.error('Error booking car rental:', error)
      alert('Failed to book car rental. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelRental = async (rentalId: string) => {
    if (!confirm('Are you sure you want to cancel this car rental?')) return
    
    try {
      // In production, you would call a cancel API endpoint
      setCarRentals(carRentals.filter(r => r.id !== rentalId))
      fetchBudget() // Refresh budget
      alert('Car rental cancelled successfully')
    } catch (error) {
      console.error('Error cancelling car rental:', error)
      alert('Failed to cancel car rental. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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

  if (!budget || !trip) {
    return (
      <Layout>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400">Budget data not available</p>
        </div>
      </Layout>
    )
  }

  const spentPercentage = (budget.totalEstimated / budget.totalBudget) * 100
  const transportPercentage = (budget.breakdown.transport / budget.totalEstimated) * 100
  const accommodationPercentage = (budget.breakdown.accommodation / budget.totalEstimated) * 100
  const activitiesPercentage = (budget.breakdown.activities / budget.totalEstimated) * 100
  const mealsPercentage = (budget.breakdown.meals / budget.totalEstimated) * 100

  // Daily spending data (mock for now)
  const dailySpending = [
    { day: 'D1', amount: 140, overBudget: false },
    { day: 'D2', amount: 180, overBudget: false },
    { day: 'D3', amount: 380, overBudget: true },
    { day: 'D4', amount: 100, overBudget: false },
    { day: 'D5', amount: 240, overBudget: false },
    { day: 'D6', amount: 160, overBudget: false },
    { day: 'D7', amount: 0, overBudget: false },
    { day: 'D8', amount: 0, overBudget: false },
  ]

  const maxDaily = Math.max(...dailySpending.map(d => d.amount), 400)

  return (
    <Layout>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
              Trip to {trip.name}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <span>{budget.days} Days</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium border border-yellow-200 dark:border-yellow-800/50">
              <span className="material-symbols-outlined text-lg">currency_exchange</span>
              <span>1 USD = 149.4 JPY</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span className="hidden sm:inline">Export PDF</span>
            </motion.button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Summary (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Total Budget Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <span className="material-symbols-outlined">account_balance_wallet</span>
                <span className="text-sm font-semibold uppercase tracking-wider">Total Budget</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  ${budget.totalBudget.toLocaleString()}
                </span>
                <span className="text-slate-400 text-sm font-medium">USD</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Spent so far</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    ${budget.totalEstimated.toLocaleString()} ({Math.round(spentPercentage)}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(spentPercentage, 100)}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      spentPercentage > 100 ? 'bg-red-500' : 'bg-primary'
                    }`}
                  ></motion.div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-right pt-1">
                  ${budget.remaining.toLocaleString()} remaining
                </p>
              </div>
            </motion.div>

            {/* Average Cost Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">
                Avg. Cost / Day
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    ${budget.costPerDay.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs font-bold">
                  <span className="material-symbols-outlined text-sm mr-1">trending_down</span>
                  -5% vs est.
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Target: ${(budget.totalBudget / budget.days).toFixed(0)}/day</p>
            </motion.div>

            {/* Mini Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/10"
            >
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">tips_and_updates</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Budget Tip</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Consider getting the JR Pass for inter-city travel to save ~15% on transport costs.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CENTER COLUMN: Breakdown (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Visualization Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Cost Distribution</h3>
              <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
                {/* Donut Chart Implementation */}
                <div className="relative size-48 rounded-full flex-shrink-0" style={{
                  background: `conic-gradient(
                    #137fec 0% ${transportPercentage}%,
                    #3b82f6 ${transportPercentage}% ${transportPercentage + accommodationPercentage}%,
                    #f59e0b ${transportPercentage + accommodationPercentage}% ${transportPercentage + accommodationPercentage + activitiesPercentage}%,
                    #10b981 ${transportPercentage + accommodationPercentage + activitiesPercentage}% 100%
                  )`
                }}>
                  <div className="absolute inset-4 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center z-10">
                    <span className="text-xs text-slate-400 font-medium uppercase">Total Est.</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${budget.totalEstimated.toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#137fec]"></span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Stay</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ${budget.breakdown.accommodation.toLocaleString()} ({Math.round(accommodationPercentage)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Transport</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ${budget.breakdown.transport.toLocaleString()} ({Math.round(transportPercentage)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Activities</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ${budget.breakdown.activities.toLocaleString()} ({Math.round(activitiesPercentage)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Meals</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ${budget.breakdown.meals.toLocaleString()} ({Math.round(mealsPercentage)}%)
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Detailed Category List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Expense Breakdown</h3>
                <button className="text-xs font-semibold text-primary hover:text-blue-600 transition-colors">
                  Download CSV
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Transport Row */}
                <details className="group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors list-none">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <span className="material-symbols-outlined">flight</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Transport</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">2 items booked</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${budget.breakdown.transport.toLocaleString()}
                      </span>
                      <span className="material-symbols-outlined text-slate-400 transform group-open:rotate-180 transition-transform">
                        expand_more
                      </span>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 pt-0 pl-[4.5rem]">
                    <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Flight JL402 (SFO → KIX)</span>
                      <span className="font-medium text-slate-900 dark:text-white">$950</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">JR Rail Pass (7 Days)</span>
                      <span className="font-medium text-slate-900 dark:text-white">$250</span>
                    </div>
                    {/* Car Rentals */}
                    {carRentals.map((rental, index) => (
                      <div key={rental.id} className="flex justify-between items-center py-2 text-sm border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-300">
                          Car Rental: {rental.car.make} {rental.car.model}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          ${rental.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {/* Add Car Rental Button */}
                    <div className="py-2 border-t border-slate-100 dark:border-slate-800">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowCarRental(true)
                          fetchAvailableCars()
                        }}
                        className="w-full px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Add Car Rental
                      </motion.button>
                    </div>
                  </div>
                </details>

                {/* Stay Row */}
                <details className="group" open>
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors list-none">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined">hotel</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Accommodation</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">2 hotels, 7 nights</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${budget.breakdown.accommodation.toLocaleString()}
                      </span>
                      <span className="material-symbols-outlined text-slate-400 transform group-open:rotate-180 transition-transform">
                        expand_more
                      </span>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 pt-0 pl-[4.5rem]">
                    <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Hotel Granvia Kyoto (4 nights)</span>
                      <span className="font-medium text-slate-900 dark:text-white">$800</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Yuzuya Ryokan (3 nights)</span>
                      <span className="font-medium text-slate-900 dark:text-white">$600</span>
                    </div>
                  </div>
                </details>

                {/* Activities Row */}
                <details className="group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors list-none">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <span className="material-symbols-outlined">local_activity</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Activities</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">4 activities planned</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${budget.breakdown.activities.toLocaleString()}
                      </span>
                      <span className="material-symbols-outlined text-slate-400 transform group-open:rotate-180 transition-transform">
                        expand_more
                      </span>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 pt-0 pl-[4.5rem]">
                    <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Fushimi Inari Shrine Tour</span>
                      <span className="font-medium text-slate-900 dark:text-white">$45</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Tea Ceremony Experience</span>
                      <span className="font-medium text-slate-900 dark:text-white">$30</span>
                    </div>
                  </div>
                </details>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Timeline & Actions (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Add Expense Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 rounded-xl h-12 px-4 bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span className="font-bold text-sm">Add Expense</span>
            </motion.button>

            {/* Alerts Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alerts</h3>
              {/* Over Budget Alert */}
              {dailySpending.some(d => d.overBudget) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl"
                >
                  <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined text-lg">warning</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">Day 3 Over Budget</p>
                    <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-1">
                      Projected $450 vs $400 limit due to Ryokan dinner.
                    </p>
                    <button className="text-xs font-bold text-red-700 dark:text-red-400 mt-2 underline">
                      Review Details
                    </button>
                  </div>
                </motion.div>
              )}
              {/* Good News Alert */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 p-4 rounded-xl"
              >
                <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-lg">savings</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">Transport Savings</p>
                  <p className="text-xs text-green-600/80 dark:text-green-400/70 mt-1">
                    You saved $50 by booking early.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Daily Spending Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Spending</h3>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">more_horiz</span>
                </button>
              </div>
              <div className="flex items-end justify-between h-40 gap-2 mt-auto">
                {dailySpending.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.amount / maxDaily) * 100}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="flex flex-col items-center gap-1 flex-1 group"
                  >
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-sm relative h-32 flex items-end overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.amount / maxDaily) * 100}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className={`w-full rounded-t-sm transition-colors ${
                          day.overBudget
                            ? 'bg-red-400 group-hover:bg-red-500'
                            : day.amount === 0
                            ? 'bg-slate-200 dark:bg-slate-600'
                            : 'bg-primary/40 group-hover:bg-primary'
                        }`}
                      ></motion.div>
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        day.overBudget ? 'text-red-500 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {day.day}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Map Section */}
        <section className="w-full mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl overflow-hidden h-48 relative shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent z-10 flex items-end p-6">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined">map</span>
                <span className="font-medium">Map View of Expenses</span>
              </div>
            </div>
            <img
              className="w-full h-full object-cover"
              alt="Map view showing locations"
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80"
            />
          </motion.div>
        </section>

        {/* Car Rental Modal */}
        {showBookingModal && selectedCar && (
          <CarRentalModal
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false)
              setSelectedCar(null)
            }}
            car={selectedCar}
            onBook={handleBookCar}
            loading={bookingLoading}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        )}

        {/* Car Rental Search Modal */}
        {showCarRental && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Car Rentals for {trip?.name}
                  </h2>
                  <button
                    onClick={() => setShowCarRental(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Available Cars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCars.map((car) => (
                    <CarRentalCard
                      key={car.id}
                      car={car}
                      onBook={(car) => {
                        setSelectedCar(car)
                        setShowBookingModal(true)
                      }}
                      currency={currency}
                      exchangeRate={exchangeRate}
                    />
                  ))}
                </div>

                {availableCars.length === 0 && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
                      directions_car
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No Cars Available
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Check back later for available car rentals.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </Layout>
  )
}
