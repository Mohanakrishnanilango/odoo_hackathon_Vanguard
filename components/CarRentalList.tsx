'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EXCHANGE_RATE } from '@/lib/currency'
import Image from 'next/image'

interface CarRental {
  id: string
  carName: string
  carType: string
  pickupLocation: string
  pickupDate: string
  pickupTime?: string
  returnDate: string
  returnTime?: string
  totalPrice: number
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  insurance: string
  features: string[]
  bookingReference?: string
  additionalServices?: string[]
  createdAt?: string
}

interface CarRentalListProps {
  rentals: CarRental[]
  onCancel?: (rentalId: string) => void
  onModify?: (rentalId: string) => void
  loading?: boolean
  currency?: 'USD' | 'INR'
  exchangeRate?: number
  showActions?: boolean
}

export default function CarRentalList({ 
  rentals, 
  onCancel, 
  onModify, 
  loading = false,
  currency = 'INR',
  exchangeRate = EXCHANGE_RATE,
  showActions = true
}: CarRentalListProps) {
  const [expandedRental, setExpandedRental] = useState<string | null>(null)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'completed': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return 'event'
      case 'active': return 'directions_car'
      case 'completed': return 'check_circle'
      case 'cancelled': return 'cancel'
      default: return 'help'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDaysRemaining = (pickupDate: string, status: string) => {
    if (status !== 'upcoming') return null
    const today = new Date()
    const pickup = new Date(pickupDate)
    const days = Math.ceil((pickup.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return days
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

  if (rentals.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
          directions_car
        </span>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No Car Rentals Found
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          You haven't booked any car rentals yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rentals.map((rental, index) => {
        const daysRemaining = getDaysRemaining(rental.pickupDate, rental.status)
        const isExpanded = expandedRental === rental.id

        return (
          <motion.div
            key={rental.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Main Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Car Image */}
                  <div className="relative w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-slate-400">
                        directions_car
                      </span>
                    </div>
                  </div>

                  {/* Car Details */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {rental.carName}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {rental.carType}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                        <span className="material-symbols-outlined text-xs mr-1">
                          {getStatusIcon(rental.status)}
                        </span>
                        {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                      </span>
                      {daysRemaining !== null && (
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {daysRemaining === 0 ? 'Today' : daysRemaining === 1 ? 'Tomorrow' : `In ${daysRemaining} days`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(rental.totalPrice)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Ref: {rental.bookingReference || rental.id.slice(0, 8)}
                  </p>
                  {showActions && (
                    <div className="flex gap-2">
                      {rental.status === 'upcoming' && onModify && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onModify(rental.id)}
                          className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Modify
                        </motion.button>
                      )}
                      {(rental.status === 'upcoming' || rental.status === 'active') && onCancel && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onCancel(rental.id)}
                          className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Cancel
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Location and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400">location_on</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Pickup</p>
                    <p className="text-slate-600 dark:text-slate-400">{rental.pickupLocation}</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {formatDate(rental.pickupDate)} at {formatTime(rental.pickupTime || '10:00')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400">location_on</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Return</p>
                    <p className="text-slate-600 dark:text-slate-400">{rental.pickupLocation}</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {formatDate(rental.returnDate)} at {formatTime(rental.returnTime || '10:00')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedRental(isExpanded ? null : rental.id)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:text-blue-600 font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
                {isExpanded ? 'Show Less' : 'Show Details'}
              </motion.button>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4"
                >
                  {/* Insurance */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Insurance Coverage</span>
                    <span className="font-medium text-slate-900 dark:text-white capitalize">
                      {rental.insurance}
                    </span>
                  </div>

                  {/* Additional Services */}
                  {(rental.additionalServices && rental.additionalServices.length > 0) && (
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Additional Services
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(rental.additionalServices || []).map((service: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Booked On</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {formatDate(rental.createdAt || rental.pickupDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Rental Period</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {Math.ceil((new Date(rental.returnDate).getTime() - new Date(rental.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3">
                    <div className="flex gap-2">
                      <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm mt-0.5">
                        info
                      </span>
                      <div className="text-xs text-amber-800 dark:text-amber-300">
                        <p className="font-medium mb-1">Important Information</p>
                        <ul className="space-y-1">
                          <li>• Bring valid driver's license and credit card</li>
                          <li>• Fuel policy: Full-to-full required</li>
                          <li>• Cancellation policy: 24 hours notice required</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
