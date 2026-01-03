'use client'

import { motion } from 'framer-motion'
import { EXCHANGE_RATE } from '@/lib/currency'

interface FlightCardProps {
  flight: {
    id: string
    airline: string
    airlineCode: string
    flightNumber: string
    aircraft: string
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
    stopAirports?: string[]
    price: {
      economy: number
      business: number
      first: number
    }
    availableSeats: {
      economy: number
      business: number
      first: number
    }
    logoUrl?: string
  }
  onSelect?: (flight: any) => void
  selected?: boolean
  currency?: 'USD' | 'INR'
  exchangeRate?: number
  classType?: 'economy' | 'business' | 'first'
}

export default function FlightCard({ 
  flight, 
  onSelect, 
  selected = false,
  currency = 'INR',
  exchangeRate = EXCHANGE_RATE,
  classType = 'economy'
}: FlightCardProps) {
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
      day: 'numeric'
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

  const currentPrice = flight.price[classType]
  const isNextDay = flight.departure.date !== flight.arrival.date

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border ${
        selected 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'border-slate-200 dark:border-slate-800'
      } hover:shadow-md transition-all duration-200 p-5`}
    >
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Airline Info */}
        <div className="flex items-center gap-4 lg:w-1/4">
          <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-slate-400">
              flight
            </span>
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{flight.airline}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {flight.flightNumber} • {flight.aircraft}
            </p>
          </div>
        </div>

        {/* Flight Route */}
        <div className="flex-1 flex items-center justify-between w-full lg:w-auto">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatTime(flight.departure.time)}
            </p>
            <p className="text-xs font-medium text-slate-400 uppercase">
              {flight.departure.airport}
            </p>
            <p className="text-xs text-slate-500">
              {formatDate(flight.departure.date)}
            </p>
          </div>

          <div className="flex flex-col items-center flex-1 px-4">
            <p className="text-xs text-slate-500 mb-1">{flight.duration}</p>
            <div className="w-full h-px bg-slate-300 dark:bg-slate-600 relative flex items-center justify-center">
              <div className="absolute w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 left-0"></div>
              <span className="material-symbols-outlined text-slate-400 text-sm transform rotate-90 bg-white dark:bg-slate-900 px-1">
                flight
              </span>
              <div className="absolute w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 right-0"></div>
            </div>
            <p className="text-xs mt-1 font-medium">
              {flight.stops === 0 ? (
                <span className="text-green-600 dark:text-green-400">Non-stop</span>
              ) : (
                <span className="text-slate-500">
                  {flight.stops} {flight.stops === 1 ? 'Stop' : 'Stops'}
                  {flight.stopAirports && ` (${flight.stopAirports.join(', ')})`}
                </span>
              )}
            </p>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatTime(flight.arrival.time)}
            </p>
            <p className="text-xs font-medium text-slate-400 uppercase">
              {flight.arrival.airport}
            </p>
            <p className="text-xs text-slate-500">
              {formatDate(flight.arrival.date)}
              {isNextDay && <span className="text-slate-400"> +1 Day</span>}
            </p>
          </div>
        </div>

        {/* Price and Selection */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-6 lg:border-l lg:border-slate-100 lg:dark:border-slate-700 lg:pl-6">
          <div className="text-right lg:text-left">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(currentPrice)}
            </p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getClassColor(classType)}`}>
                {classType.charAt(0).toUpperCase() + classType.slice(1)}
              </span>
              <span className="text-xs text-slate-500">
                {flight.availableSeats[classType]} seats left
              </span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect?.(flight)}
            className={`px-6 py-2.5 rounded-lg font-medium shadow-sm transition ${
              selected
                ? 'bg-primary text-white'
                : 'bg-primary hover:bg-primary-dark text-white'
            }`}
          >
            {selected ? 'Selected' : 'Select'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
