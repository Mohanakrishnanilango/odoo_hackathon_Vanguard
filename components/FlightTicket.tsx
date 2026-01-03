'use client'

import { motion } from 'framer-motion'
import { EXCHANGE_RATE } from '@/lib/currency'

interface FlightTicketProps {
  booking: {
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
    }
    paymentMethod: string
  }
  currency?: 'USD' | 'INR'
  exchangeRate?: number
}

export default function FlightTicket({ 
  booking, 
  currency = 'INR',
  exchangeRate = EXCHANGE_RATE
}: FlightTicketProps) {
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getClassColor = (classType: string) => {
    switch (classType) {
      case 'economy': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'business': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'first': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    }
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 dark:text-green-400'
      case 'pending': return 'text-amber-600 dark:text-amber-400'
      case 'refunded': return 'text-slate-600 dark:text-slate-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  const isNextDay = booking.flight.departure.date !== booking.flight.arrival.date

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{booking.flight.airline}</h3>
            <p className="text-blue-100">{booking.flight.flightNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatCurrency(booking.totalPrice)}</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassColor(booking.classType)}`}>
              {booking.classType.charAt(0).toUpperCase() + booking.classType.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-6">
        {/* Flight Route */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatTime(booking.flight.departure.time)}
            </p>
            <p className="text-sm font-medium text-slate-400 uppercase">
              {booking.flight.departure.airport}
            </p>
            <p className="text-xs text-slate-500">
              {formatDate(booking.flight.departure.date)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Terminal {booking.flight.departure.terminal}
            </p>
          </div>

          <div className="flex flex-col items-center flex-1 px-4">
            <p className="text-sm text-slate-500 mb-1">{booking.flight.duration}</p>
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
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatTime(booking.flight.arrival.time)}
            </p>
            <p className="text-sm font-medium text-slate-400 uppercase">
              {booking.flight.arrival.airport}
            </p>
            <p className="text-xs text-slate-500">
              {formatDate(booking.flight.arrival.date)}
              {isNextDay && <span className="text-slate-400"> +1 Day</span>}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Terminal {booking.flight.arrival.terminal}
            </p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-slate-600 dark:text-slate-400">Booking Reference</p>
            <p className="font-medium text-slate-900 dark:text-white">{booking.bookingReference}</p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Booking Date</p>
            <p className="font-medium text-slate-900 dark:text-white">{formatDate(booking.bookingDate)}</p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Status</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Payment</p>
            <span className={`font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </span>
          </div>
        </div>

        {/* Passenger Information */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Passengers</h4>
          <div className="space-y-2">
            {booking.passengers.map((passenger, index) => (
              <div key={index} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <span className="font-medium text-slate-900 dark:text-white">{passenger.name}</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs capitalize">
                  {passenger.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Additional Services</h4>
          <div className="flex flex-wrap gap-2">
            {booking.additionalServices.travelInsurance && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-xs font-medium text-green-700 dark:text-green-400">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Travel Insurance
              </span>
            )}
            {booking.additionalServices.extraBaggage && (
              <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Extra Baggage
              </span>
            )}
            {booking.additionalServices.seatSelection && (
              <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs font-medium text-purple-700 dark:text-purple-400">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Seat Selection
              </span>
            )}
          </div>
        </div>

        {/* Barcode */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center justify-center">
            <div className="bg-slate-900 text-white p-2 rounded">
              <div className="flex space-x-1">
                {booking.bookingReference.split('').map((char, index) => (
                  <div
                    key={index}
                    className="w-1 h-4 bg-white"
                    style={{
                      width: char === ' ' ? '4px' : '2px',
                      height: char === ' ' ? '4px' : '16px',
                      backgroundColor: Math.random() > 0.5 ? '#fff' : '#000'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
            Booking Reference: {booking.bookingReference}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
