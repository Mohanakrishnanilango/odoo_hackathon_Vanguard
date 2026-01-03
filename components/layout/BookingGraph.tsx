'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface BookingData {
  date: string
  amount: number
  type: 'hotel' | 'flight' | 'activity'
}

interface BookingGraphProps {
  tripId?: string
}

export default function BookingGraph({ tripId }: BookingGraphProps) {
  const [bookingData, setBookingData] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalBudget, setTotalBudget] = useState(0)
  const [spentBudget, setSpentBudget] = useState(0)

  useEffect(() => {
    fetchBookingData()
  }, [tripId])

  const fetchBookingData = async () => {
    try {
      const url = tripId ? `/api/trips/${tripId}/bookings` : '/api/bookings'
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.bookings) {
        setBookingData(data.bookings)
        const total = data.bookings.reduce((sum: number, booking: BookingData) => sum + booking.amount, 0)
        setSpentBudget(total)
      }
      
      if (data.budget) {
        setTotalBudget(data.budget)
      }
    } catch (error) {
      console.error('Error fetching booking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const budgetPercentage = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0
  const remainingBudget = totalBudget - spentBudget

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Booking Overview</h3>
      
      {/* Budget Summary */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Budget Used</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            ${spentBudget.toLocaleString()} / ${totalBudget.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-2 rounded-full ${
              budgetPercentage > 90 ? 'bg-red-500' : 
              budgetPercentage > 70 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {budgetPercentage.toFixed(1)}% used
          </span>
          <span className={`text-xs font-bold ${
            remainingBudget < 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            {remainingBudget < 0 ? `Over $${Math.abs(remainingBudget).toLocaleString()}` : 
             remainingBudget === 0 ? 'On budget' : 
             `$${remainingBudget.toLocaleString()} left`}
          </span>
        </div>
      </div>

      {/* Simple Bar Chart */}
      {bookingData.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Bookings by Date</p>
          <div className="flex items-end gap-1 h-16">
            {bookingData.slice(-7).map((booking, index) => {
              const maxAmount = Math.max(...bookingData.map(b => b.amount))
              const height = maxAmount > 0 ? (booking.amount / maxAmount) * 100 : 0
              
              return (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex-1 bg-primary rounded-t-sm relative group cursor-pointer"
                  title={`${booking.type}: $${booking.amount}`}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${booking.amount}
                  </div>
                </motion.div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Recent</span>
            <span>Latest</span>
          </div>
        </div>
      )}

      {bookingData.length === 0 && (
        <div className="text-center py-4">
          <span className="material-symbols-outlined text-2xl text-slate-300 dark:text-slate-600">bar_chart</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No bookings yet</p>
        </div>
      )}
    </div>
  )
}
