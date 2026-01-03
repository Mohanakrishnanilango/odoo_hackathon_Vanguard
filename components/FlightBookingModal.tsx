'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EXCHANGE_RATE } from '@/lib/currency'

interface FlightBookingModalProps {
  isOpen: boolean
  onClose: () => void
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
  }
  onBook: (bookingData: FlightBookingData) => void
  loading?: boolean
  currency?: 'USD' | 'INR'
  exchangeRate?: number
  searchData?: {
    tripType: 'roundTrip' | 'oneWay' | 'multiCity'
    departureDate: string
    returnDate?: string
    travelers: {
      adults: number
      children: number
      infants: number
    }
    classType: 'economy' | 'business' | 'first'
  }
}

export interface FlightBookingData {
  flightId: string
  tripType: 'roundTrip' | 'oneWay' | 'multiCity'
  classType: 'economy' | 'business' | 'first'
  travelers: {
    adults: number
    children: number
    infants: number
  }
  passengerDetails: Array<{
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
  }>
  returnFlightId?: string
  totalPrice: number
  paymentMethod: 'card' | 'upi' | 'netBanking'
  additionalServices: {
    travelInsurance: boolean
    extraBaggage: boolean
    seatSelection: boolean
  }
}

export default function FlightBookingModal({ 
  isOpen, 
  onClose, 
  flight, 
  onBook, 
  loading = false,
  currency = 'INR',
  exchangeRate = EXCHANGE_RATE,
  searchData
}: FlightBookingModalProps) {
  const [bookingData, setBookingData] = useState<FlightBookingData>({
    flightId: flight.id,
    tripType: searchData?.tripType || 'oneWay',
    classType: searchData?.classType || 'economy',
    travelers: searchData?.travelers || { adults: 1, children: 0, infants: 0 },
    passengerDetails: [],
    returnFlightId: '',
    totalPrice: 0,
    paymentMethod: 'card',
    additionalServices: {
      travelInsurance: false,
      extraBaggage: false,
      seatSelection: false
    }
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  // Initialize passenger details when component mounts
  useEffect(() => {
    if (bookingData.passengerDetails.length === 0) {
      initializePassengerDetails()
    }
  }, [])

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
    const basePrice = flight.price[bookingData.classType]
    const totalTravelers = bookingData.travelers.adults + bookingData.travelers.children
    
    let totalPrice = basePrice * totalTravelers
    
    // Add additional services costs
    if (bookingData.additionalServices.travelInsurance) {
      totalPrice += totalTravelers * 50
    }
    if (bookingData.additionalServices.extraBaggage) {
      totalPrice += totalTravelers * 30
    }
    if (bookingData.additionalServices.seatSelection) {
      totalPrice += totalTravelers * 15
    }
    
    return totalPrice
  }

  const initializePassengerDetails = () => {
    const totalTravelers = bookingData.travelers.adults + bookingData.travelers.children + bookingData.travelers.infants
    const details = Array(totalTravelers).fill(null).map((_, index) => ({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    }))
    
    setBookingData({ ...bookingData, passengerDetails: details })
  }

  const handleInputChange = (field: keyof FlightBookingData, value: any) => {
    const newData = { ...bookingData, [field]: value }
    
    // Recalculate total price when relevant fields change
    if (field === 'classType' || field === 'travelers' || field === 'additionalServices') {
      newData.totalPrice = calculateTotalPrice()
    }
    
    setBookingData(newData)
  }

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const newPassengers = [...bookingData.passengerDetails]
    newPassengers[index] = { ...newPassengers[index], [field]: value }
    setBookingData({ ...bookingData, passengerDetails: newPassengers })
  }

  const handleSubmit = () => {
    // Ensure passenger details are initialized
    if (bookingData.passengerDetails.length === 0) {
      initializePassengerDetails()
      return
    }
    
    // Validate all required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber']
    for (let i = 0; i < bookingData.passengerDetails.length; i++) {
      for (const field of requiredFields) {
        const value = bookingData.passengerDetails[i][field as keyof typeof bookingData.passengerDetails[0]]
        if (!value || value.trim() === '') {
          alert(`Please fill in all required fields for Passenger ${i + 1}`)
          return
        }
        
        // Additional validation for email
        if (field === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            alert(`Please enter a valid email address for Passenger ${i + 1}`)
            return
          }
        }
        
        // Additional validation for phone
        if (field === 'phoneNumber' && value) {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/
          if (!phoneRegex.test(value) || value.length < 10) {
            alert(`Please enter a valid phone number for Passenger ${i + 1}`)
            return
          }
        }
      }
    }
    
    onBook(bookingData)
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
      day: 'numeric'
    })
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
              Book Your Flight
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-4">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {step}
                </div>
                {step < 2 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Flight Summary */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Flight Summary</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatTime(flight.departure.time)}
                  </p>
                  <p className="text-xs text-slate-500">{flight.departure.airport}</p>
                  <p className="text-xs text-slate-500">{formatDate(flight.departure.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">flight</span>
                  <span className="text-xs text-slate-500">{flight.duration}</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatTime(flight.arrival.time)}
                  </p>
                  <p className="text-xs text-slate-500">{flight.arrival.airport}</p>
                  <p className="text-xs text-slate-500">{formatDate(flight.arrival.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(flight.price[bookingData.classType])}
                </p>
                <p className="text-xs text-slate-500 capitalize">{bookingData.classType}</p>
              </div>
            </div>
          </div>

          {/* Step 1: Passenger Details & Services */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Traveler Information
                </h3>
                <div className="space-y-4">
                  {Array.from({ length: bookingData.travelers.adults + bookingData.travelers.children + bookingData.travelers.infants }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                        {index < bookingData.travelers.adults ? `Adult ${index + 1}` : 
                         index < bookingData.travelers.adults + bookingData.travelers.children ? `Child ${index - bookingData.travelers.adults + 1}` :
                         `Infant ${index - bookingData.travelers.adults - bookingData.travelers.children + 1}`}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={bookingData.passengerDetails[index]?.firstName || ''}
                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={bookingData.passengerDetails[index]?.lastName || ''}
                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Last name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={bookingData.passengerDetails[index]?.email || ''}
                            onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={bookingData.passengerDetails[index]?.phoneNumber || ''}
                            onChange={(e) => handlePassengerChange(index, 'phoneNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Services */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Additional Services
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Travel Insurance</p>
                      <p className="text-sm text-slate-500">Coverage for trip cancellation, medical emergencies</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(50)}</span>
                      <input
                        type="checkbox"
                        checked={bookingData.additionalServices.travelInsurance}
                        onChange={(e) => handleInputChange('additionalServices', {
                          ...bookingData.additionalServices,
                          travelInsurance: e.target.checked
                        })}
                        className="text-primary focus:ring-primary"
                      />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Extra Baggage</p>
                      <p className="text-sm text-slate-500">Additional checked baggage allowance</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(30)}</span>
                      <input
                        type="checkbox"
                        checked={bookingData.additionalServices.extraBaggage}
                        onChange={(e) => handleInputChange('additionalServices', {
                          ...bookingData.additionalServices,
                          extraBaggage: e.target.checked
                        })}
                        className="text-primary focus:ring-primary"
                      />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Seat Selection</p>
                      <p className="text-sm text-slate-500">Choose your preferred seat</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(15)}</span>
                      <input
                        type="checkbox"
                        checked={bookingData.additionalServices.seatSelection}
                        onChange={(e) => handleInputChange('additionalServices', {
                          ...bookingData.additionalServices,
                          seatSelection: e.target.checked
                        })}
                        className="text-primary focus:ring-primary"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Payment Method
                </h3>
                <div className="space-y-3">
                  {['card', 'upi', 'netBanking'].map((method) => (
                    <label key={method} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={bookingData.paymentMethod === method}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="capitalize">{method === 'upi' ? 'UPI' : method === 'netBanking' ? 'Net Banking' : 'Credit/Debit Card'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Price Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Fare ({bookingData.travelers.adults + bookingData.travelers.children} travelers)</span>
                    <span>{formatCurrency(flight.price[bookingData.classType] * (bookingData.travelers.adults + bookingData.travelers.children))}</span>
                  </div>
                  {bookingData.additionalServices.travelInsurance && (
                    <div className="flex justify-between text-sm">
                      <span>Travel Insurance</span>
                      <span>{formatCurrency(50 * (bookingData.travelers.adults + bookingData.travelers.children))}</span>
                    </div>
                  )}
                  {bookingData.additionalServices.extraBaggage && (
                    <div className="flex justify-between text-sm">
                      <span>Extra Baggage</span>
                      <span>{formatCurrency(30 * (bookingData.travelers.adults + bookingData.travelers.children))}</span>
                    </div>
                  )}
                  {bookingData.additionalServices.seatSelection && (
                    <div className="flex justify-between text-sm">
                      <span>Seat Selection</span>
                      <span>{formatCurrency(15 * (bookingData.travelers.adults + bookingData.travelers.children))}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotalPrice())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 2 ? (
              <button
                onClick={() => {
                  // Ensure passenger details are initialized before moving to next step
                  if (bookingData.passengerDetails.length === 0) {
                    initializePassengerDetails()
                  }
                  setCurrentStep(currentStep + 1)
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Complete Booking'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
