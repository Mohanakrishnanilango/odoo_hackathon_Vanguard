'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EXCHANGE_RATE } from '@/lib/currency'

interface CarRentalCardProps {
  car: {
    id: string
    name: string
    make?: string
    model?: string
    year?: number
    type: string
    seats: number
    transmission: string
    fuel: string
    pricePerDay: number
    rating: number
    reviews: number
    imageUrl?: string
    features: string[]
    available: boolean
  }
  onBook?: (car: any) => void
  currency?: 'USD' | 'INR'
  exchangeRate?: number
}

export default function CarRentalCard({ 
  car, 
  onBook, 
  currency = 'INR', 
  exchangeRate = EXCHANGE_RATE 
}: CarRentalCardProps) {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'economy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'compact': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'midsize': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'suv': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'luxury': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    }
  }

  const getFuelIcon = (fuel: string) => {
    switch (fuel) {
      case 'gasoline': return 'local_gas_station'
      case 'diesel': return 'local_gas_station'
      case 'electric': return 'electric_car'
      case 'hybrid': return 'electric_car'
      default: return 'directions_car'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden ${
        !car.available ? 'opacity-60' : ''
      }`}
    >
      {/* Car Image */}
      <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
        {car.imageUrl ? (
          <Image
            src={car.imageUrl}
            alt={car.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-slate-400">
              directions_car
            </span>
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            car.available 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {car.available ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Rating */}
        {car.rating && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
            <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
            <span className="font-medium">{car.rating}</span>
          </div>
        )}
      </div>

      {/* Car Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {car.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {car.year || '2024'} • {car.seats} seats • {car.transmission}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(car.type)}`}>
            {car.type}
          </span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {car.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400"
            >
              {feature}
            </span>
          ))}
          {car.features.length > 3 && (
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500 dark:text-slate-400">
              +{car.features.length - 3} more
            </span>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined text-sm">{getFuelIcon(car.fuel)}</span>
              <span className="capitalize">{car.fuel}</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {car.seats} seats
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">per day</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(car.pricePerDay)}
            </p>
          </div>
        </div>

        {/* Book Button */}
        {car.available && onBook && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBook(car)}
            className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            Book Now
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
