'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EXCHANGE_RATE } from '@/lib/currency'
import Image from 'next/image'

interface CarRentalModalProps {
  isOpen: boolean
  onClose: () => void
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
  onBook: (bookingData: BookingData) => void
  loading?: boolean
  currency?: 'USD' | 'INR'
  exchangeRate?: number
}

export interface BookingData {
  carId: string
  pickupLocation: string
  pickupDate: string
  pickupTime: string
  returnDate: string
  returnTime: string
  driverAge: number
  additionalDrivers: number
  insurance: 'basic' | 'premium' | 'none'
  gps: boolean
  childSeat: boolean
  additionalInsurance: boolean
  totalPrice: number
}

export default function CarRentalModal({ 
  isOpen, 
  onClose, 
  car, 
  onBook, 
  loading = false,
  currency = 'INR',
  exchangeRate = EXCHANGE_RATE
}: CarRentalModalProps) {
  const [bookingData, setBookingData] = useState<BookingData>({
    carId: car.id,
    pickupLocation: '',
    pickupDate: '',
    pickupTime: '10:00',
    returnDate: '',
    returnTime: '10:00',
    driverAge: 25,
    additionalDrivers: 0,
    insurance: 'basic',
    gps: false,
    childSeat: false,
    additionalInsurance: false,
    totalPrice: 0
  })

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

  const calculateTotalPrice = () => {
    if (!bookingData.pickupDate || !bookingData.returnDate) return 0
    
    const pickup = new Date(bookingData.pickupDate)
    const returnDate = new Date(bookingData.returnDate)
    const days = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))
    
    if (days <= 0) return 0
    
    let totalPrice = car.pricePerDay * days
    
    // Insurance costs
    if (bookingData.insurance === 'basic') totalPrice += days * 15
    if (bookingData.insurance === 'premium') totalPrice += days * 25
    
    // Additional services
    if (bookingData.gps) totalPrice += days * 5
    if (bookingData.childSeat) totalPrice += days * 8
    if (bookingData.additionalInsurance) totalPrice += days * 12
    if (bookingData.additionalDrivers > 0) totalPrice += bookingData.additionalDrivers * days * 10
    
    // Young driver fee
    if (bookingData.driverAge < 25) totalPrice += days * 20
    
    return totalPrice
  }

  const handleInputChange = (field: keyof BookingData, value: any) => {
    const newData = { ...bookingData, [field]: value }
    if (field === 'pickupDate' || field === 'returnDate' || field === 'insurance' || 
        field === 'gps' || field === 'childSeat' || field === 'additionalInsurance' || 
        field === 'additionalDrivers' || field === 'driverAge') {
      newData.totalPrice = calculateTotalPrice()
    }
    setBookingData(newData)
  }

  const handleSubmit = () => {
    if (!bookingData.pickupLocation || !bookingData.pickupDate || !bookingData.returnDate) {
      alert('Please fill in all required fields')
      return
    }
    
    onBook(bookingData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Book {car.name}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Car Details */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="relative h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4">
                  {car.imageUrl ? (
                    <Image
                      src={car.imageUrl}
                      alt={car.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-400">
                        directions_car
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  {car.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {car.year || '2024'} • {car.seats} seats • {car.transmission}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Type</span>
                    <span className="font-medium capitalize">{car.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Fuel</span>
                    <span className="font-medium capitalize">{car.fuel}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Daily Rate</span>
                    <span className="font-medium">{formatCurrency(car.pricePerDay)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {car.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-xs text-slate-600 dark:text-slate-400"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pickup & Return */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pickup Location *
                  </label>
                  <input
                    type="text"
                    value={bookingData.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    placeholder="City or Airport"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Driver Age *
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="99"
                    value={bookingData.driverAge}
                    onChange={(e) => handleInputChange('driverAge', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {bookingData.driverAge < 25 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Young driver fee applies
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pickup Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.pickupDate}
                    onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={bookingData.pickupTime}
                    onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Return Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    min={bookingData.pickupDate}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Return Time
                  </label>
                  <input
                    type="time"
                    value={bookingData.returnTime}
                    onChange={(e) => handleInputChange('returnTime', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Insurance */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Insurance Coverage
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'none', label: 'No Insurance', desc: 'Basic coverage only' },
                    { value: 'basic', label: 'Basic', desc: 'Collision damage waiver' },
                    { value: 'premium', label: 'Premium', desc: 'Full coverage + zero deductible' }
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange('insurance', option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        bookingData.insurance === option.value
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-medium text-slate-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {option.desc}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Additional Services */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Additional Services
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={bookingData.gps}
                        onChange={(e) => handleInputChange('gps', e.target.checked)}
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">GPS Navigation</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{formatCurrency(5)}/day</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={bookingData.childSeat}
                        onChange={(e) => handleInputChange('childSeat', e.target.checked)}
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Child Seat</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{formatCurrency(8)}/day</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={bookingData.additionalInsurance}
                        onChange={(e) => handleInputChange('additionalInsurance', e.target.checked)}
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Additional Insurance</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{formatCurrency(12)}/day</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Additional Drivers
                    </label>
                    <select
                      value={bookingData.additionalDrivers}
                      onChange={(e) => handleInputChange('additionalDrivers', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value={0}>No additional drivers</option>
                      <option value={1}>1 additional driver</option>
                      <option value={2}>2 additional drivers</option>
                    </select>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {formatCurrency(10)}/day per additional driver
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Price Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Daily Rate</span>
                    <span className="font-medium">{formatCurrency(car.pricePerDay)}</span>
                  </div>
                  {bookingData.pickupDate && bookingData.returnDate && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Rental Days</span>
                        <span className="font-medium">
                          {Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Price</span>
                          <span className="text-primary">{formatCurrency(calculateTotalPrice())}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Booking...' : `Book ${formatCurrency(calculateTotalPrice())}`}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
