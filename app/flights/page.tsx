'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import FlightSearch, { FlightSearchData } from '@/components/FlightSearch'
import FlightCard from '@/components/FlightCard'
import FlightBookingModal, { FlightBookingData } from '@/components/FlightBookingModal'
import FlightList from '@/components/FlightList'
import { EXCHANGE_RATE } from '@/lib/currency'

interface Flight {
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

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [bookings, setBookings] = useState<FlightBooking[]>([])
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [searchData, setSearchData] = useState<FlightSearchData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [currency] = useState<'USD' | 'INR'>('INR')
  const [exchangeRate] = useState(EXCHANGE_RATE)

  useEffect(() => {
    fetchUserBookings()
    // Auto-search with default data for demo
    const defaultSearchData: FlightSearchData = {
      tripType: 'roundTrip',
      from: 'Coimbatore (CJB)',
      to: 'Chennai (MAA)',
      departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      travelers: { adults: 1, children: 0, infants: 0 },
      classType: 'economy',
      directFlightsOnly: false
    }
    handleSearch(defaultSearchData)
  }, [])

  const fetchUserBookings = async () => {
    try {
      // In a real app, this would fetch user's flight bookings
      // For now, we'll use mock data
      const mockBookings: FlightBooking[] = []
      setBookings(mockBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const handleSearch = async (searchData: FlightSearchData) => {
    setSearchLoading(true)
    setSearchData(searchData)
    
    try {
      const params = new URLSearchParams({
        from: searchData.from,
        to: searchData.to,
        departureDate: searchData.departureDate,
        tripType: searchData.tripType,
        adults: searchData.travelers.adults.toString(),
        children: searchData.travelers.children.toString(),
        infants: searchData.travelers.infants.toString(),
        classType: searchData.classType,
        directFlightsOnly: searchData.directFlightsOnly.toString()
      })

      if (searchData.tripType === 'roundTrip' && searchData.returnDate) {
        params.append('returnDate', searchData.returnDate)
      }

      const response = await fetch(`/api/flights?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setFlights(data.flights || [])
      } else {
        console.error('Search failed:', data.error)
        alert('Failed to search flights')
      }
    } catch (error) {
      console.error('Error searching flights:', error)
      alert('Failed to search flights')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight)
    setShowBookingModal(true)
  }

  const handleBookFlight = async (bookingData: FlightBookingData) => {
    setBookingLoading(true)
    
    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowBookingModal(false)
        setSelectedFlight(null)
        alert('Flight booked successfully!')
        
        // Refresh bookings
        fetchUserBookings()
        
        // Reset search
        setFlights([])
        setSearchData(null)
      } else {
        alert(data.error || 'Failed to book flight')
      }
    } catch (error) {
      console.error('Error booking flight:', error)
      alert('Failed to book flight. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this flight booking?')) return
    
    try {
      const response = await fetch(`/api/flights/${bookingId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Flight booking cancelled successfully!')
        fetchUserBookings()
      } else {
        alert(data.error || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const handleCheckIn = (bookingId: string) => {
    alert('Check-in feature coming soon!')
  }

  const handleModify = (bookingId: string) => {
    alert('Modify booking feature coming soon!')
  }

  return (
    <Layout>
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Book Your Flights
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Find the best deals for your journey
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMap(!showMap)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition"
              >
                <span className="material-symbols-outlined text-lg">map</span>
                {showMap ? 'Hide Map' : 'Show Map'}
              </motion.button>
            </div>
          </div>

          {/* Flight Search */}
          <FlightSearch onSearch={handleSearch} loading={searchLoading} />

          {/* Search Results */}
          {searchData && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                Available Flights
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {flights.length} results
                </span>
              </h2>
              
              {searchLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : flights.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
                  <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
                    flight_off
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Flights Found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Try adjusting your search criteria or dates.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      onSelect={handleFlightSelect}
                      selected={selectedFlight?.id === flight.id}
                      currency={currency}
                      exchangeRate={exchangeRate}
                      classType={searchData.classType}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Existing Bookings */}
          {bookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Your Flight Bookings
              </h2>
              <FlightList
                bookings={bookings}
                onCancel={handleCancelBooking}
                onModify={handleModify}
                onCheckIn={handleCheckIn}
                loading={loading}
                currency={currency}
                exchangeRate={exchangeRate}
                showActions={true}
                showStatus={true}
              />
            </div>
          )}

          {/* Map View */}
          {showMap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">
                    map
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Interactive map view coming soon
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Flight Booking Modal */}
      {showBookingModal && selectedFlight && searchData && (
        <FlightBookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedFlight(null)
          }}
          flight={selectedFlight}
          onBook={handleBookFlight}
          loading={bookingLoading}
          currency={currency}
          exchangeRate={exchangeRate}
          searchData={searchData}
        />
      )}
    </Layout>
  )
}
