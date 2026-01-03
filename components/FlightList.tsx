'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EXCHANGE_RATE } from '@/lib/currency'

interface FlightBooking {
  id: string
  bookingReference: string
  flight: {
    airline: string
    flightNumber: string
    departure: {
      airport: string
      city: string
      time: string
      date: string
      terminal: string
    }
    arrival: {
      airport: string
      city: string
      time: string
      date: string
      terminal: string
    }
    duration: string
    stops: number
  }
  passengers: Array<{
    name: string
    type: 'adult' | 'child' | 'infant'
  }>
  classType: 'economy' | 'business' | 'first'
  totalPrice: number
  status: 'upcoming' | 'completed' | 'cancelled' | 'check-in'
  paymentStatus: 'paid' | 'pending' | 'refunded'
  bookingDate: string
  additionalServices: {
    travelInsurance: boolean
    extraBaggage: boolean
    seatSelection: boolean
    mealPreference: string
  }
}

interface FlightListProps {
  bookings: FlightBooking[]
  onCancel?: (bookingId: string) => void
  onModify?: (bookingId: string) => void
  onCheckIn?: (bookingId: string) => void
  loading?: boolean
  currency?: 'USD' | 'INR'
  exchangeRate?: number
  showActions?: boolean
  showStatus?: boolean
}

export default function FlightList({ 
  bookings, 
  onCancel, 
  onModify, 
  onCheckIn,
  loading = false,
  currency = 'INR',
  exchangeRate = EXCHANGE_RATE,
  showActions = true,
  showStatus = true
}: FlightListProps) {
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null)

  const convertCurrency = (amount: number) => {
    if (currency === 'INR') {
      return Math.round(amount * exchangeRate)
    }
    return amount
  }

  const formatCurrency = (amount: number) => {
    const converted = convertCurrency(amount)
    const symbol = currency === 'INR' ? '₹' : '$'
    return `${symbol}${converted.toLocaleString()}`
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'check-in': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return 'event'
      case 'completed': return 'check_circle'
      case 'cancelled': return 'cancel'
      case 'check-in': return 'airline_seat_recline_normal'
      default: return 'help'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 dark:text-green-400'
      case 'pending': return 'text-amber-600 dark:text-amber-400'
      case 'refunded': return 'text-slate-600 dark:text-slate-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  const getClassColor = (classType: string) => {
    switch (classType) {
      case 'economy': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'business': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'first': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    }
  }

  const getDaysUntil = (date: string) => {
    const today = new Date()
    const flightDate = new Date(date)
    const diffTime = flightDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
          flight
        </span>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No Flight Bookings Found
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          You haven't booked any flights yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking, index) => {
        const isExpanded = expandedBooking === booking.id
        const daysUntil = getDaysUntil(booking.flight.departure.date)

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Main Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Airline Icon */}
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-slate-400">
                      flight
                    </span>
                  </div>

                  {/* Flight Details */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {booking.flight.airline} {booking.flight.flightNumber}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {booking.flight.departure.city} → {booking.flight.arrival.city}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {showStatus && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          <span className="material-symbols-outlined text-xs mr-1">
                            {getStatusIcon(booking.status)}
                          </span>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      )}
                      {booking.status === 'upcoming' && daysUntil <= 3 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Ref: {booking.bookingReference}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getClassColor(booking.classType)}`}>
                      {booking.classType.charAt(0).toUpperCase() + booking.classType.slice(1)}
                    </span>
                    <span className={`text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </span>
                  </div>
                  {showActions && (
                    <div className="flex gap-2">
                      {booking.status === 'upcoming' && onCheckIn && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onCheckIn(booking.id)}
                          className="px-3 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                        >
                          Check-in
                        </motion.button>
                      )}
                      {booking.status === 'upcoming' && onModify && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onModify(booking.id)}
                          className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Modify
                        </motion.button>
                      )}
                      {(booking.status === 'upcoming' || booking.status === 'check-in') && onCancel && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onCancel(booking.id)}
                          className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Cancel
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Flight Route */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatTime(booking.flight.departure.time)}
                  </p>
                  <p className="text-xs font-medium text-slate-400 uppercase">
                    {booking.flight.departure.airport}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(booking.flight.departure.date)}
                  </p>
                </div>

                <div className="flex flex-col items-center flex-1 px-4">
                  <p className="text-xs text-slate-500 mb-1">{booking.flight.duration}</p>
                  <div className="w-full h-px bg-slate-300 dark:bg-slate-600 relative flex items-center justify-center">
                    <div className="absolute w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 left-0"></div>
                    <span className="material-symbols-outlined text-slate-400 text-sm transform rotate-90 bg-white dark:bg-slate-900 px-1">
                      flight
                    </span>
                    <div className="absolute w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 right-0"></div>
                  </div>
                  <p className="text-xs mt-1 font-medium">
                    {booking.flight.stops === 0 ? (
                      <span className="text-green-600 dark:text-green-400">Non-stop</span>
                    ) : (
                      <span className="text-slate-500">
                        {booking.flight.stops} {booking.flight.stops === 1 ? 'Stop' : 'Stops'}
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatTime(booking.flight.arrival.time)}
                  </p>
                  <p className="text-xs font-medium text-slate-400 uppercase">
                    {booking.flight.arrival.airport}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(booking.flight.arrival.date)}
                  </p>
                </div>
              </div>

              {/* Expand/Collapse Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:text-blue-600 font-medium transition-colors"
              >
                {isExpanded ? (
                  <>
                    <span className="material-symbols-outlined text-lg">expand_less</span>
                    Hide Details
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                    Show Details
                  </>
                )}
              </motion.button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Passengers */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Passengers</h4>
                    <div className="space-y-2">
                      {booking.passengers.map((passenger, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">{passenger.name}</span>
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs capitalize">
                            {passenger.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Booking Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Booked On</span>
                        <span className="text-slate-900 dark:text-white">{formatDate(booking.bookingDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Payment Status</span>
                        <span className={`font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Class</span>
                        <span className="text-slate-900 dark:text-white capitalize">{booking.classType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Services */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Additional Services</h4>
                    <div className="space-y-2">
                      {booking.additionalServices.travelInsurance && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                          <span className="text-slate-600 dark:text-slate-400">Travel Insurance</span>
                        </div>
                      )}
                      {booking.additionalServices.extraBaggage && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                          <span className="text-slate-600 dark:text-slate-400">Extra Baggage</span>
                        </div>
                      )}
                      {booking.additionalServices.seatSelection && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                          <span className="text-slate-600 dark:text-slate-400">Seat Selection</span>
                        </div>
                      )}
                      {booking.additionalServices.mealPreference !== 'none' && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                          <span className="text-slate-600 dark:text-slate-400 capitalize">
                            {booking.additionalServices.mealPreference} Meal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terminal Information */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Terminal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Departure Terminal</span>
                        <span className="text-slate-900 dark:text-white">{booking.flight.departure.terminal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Arrival Terminal</span>
                        <span className="text-slate-900 dark:text-white">{booking.flight.arrival.terminal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
