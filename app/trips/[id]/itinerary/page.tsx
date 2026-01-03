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

interface City {
  id: string
  name: string
  country: string
  costIndex: number
  popularity: number
  imageUrl?: string
  latitude?: number
  longitude?: number
}

interface Stop {
  id: string
  city: City
  arrivalDate: string
  departureDate: string
  order: number
  activities: Array<{
    id: string
    name: string
    cost: number
    duration: number
  }>
}

export default function ItineraryBuilderPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string
  const [stops, setStops] = useState<Stop[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCitySearch, setShowCitySearch] = useState(false)
  const [showMap, setShowMap] = useState(false)
  
  // Car rental states
  const [showCarRental, setShowCarRental] = useState(false)
  const [availableCars, setAvailableCars] = useState<any[]>([])
  const [selectedCar, setSelectedCar] = useState<any>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [currency] = useState<'USD' | 'INR'>('INR')
  const [exchangeRate] = useState(EXCHANGE_RATE)

  useEffect(() => {
    fetchStops()
  }, [tripId])

  const fetchStops = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/stops`)
      const data = await response.json()
      setStops(data.stops || [])
    } catch (error) {
      console.error('Error fetching stops:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchCities = async (query: string) => {
    if (!query) {
      setCities([])
      return
    }

    try {
      const response = await fetch(`/api/cities?search=${encodeURIComponent(query)}&limit=10`)
      const data = await response.json()
      setCities(data.cities || [])
    } catch (error) {
      console.error('Error searching cities:', error)
    }
  }

  const handleAddCity = async (cityId: string) => {
    try {
      const tripResponse = await fetch(`/api/trips/${tripId}`)
      const tripData = await tripResponse.json()
      const trip = tripData.trip

      const arrivalDate = stops.length === 0
        ? trip.startDate
        : new Date(stops[stops.length - 1].departureDate)

      const departureDate = new Date(arrivalDate)
      departureDate.setDate(departureDate.getDate() + 2)

      const response = await fetch(`/api/trips/${tripId}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId,
          arrivalDate: arrivalDate.toISOString(),
          departureDate: departureDate.toISOString(),
        }),
      })

      if (response.ok) {
        fetchStops()
        setShowCitySearch(false)
        setSearchQuery('')
      }
    } catch (error) {
      console.error('Error adding city:', error)
    }
  }

  const handlePlaceSelect = async (place: {
    name: string
    address: string
    lat: number
    lng: number
    placeId?: string
  }) => {
    try {
      // Extract country from address
      const addressParts = place.address.split(',').map(s => s.trim())
      const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : 'Unknown'
      
      // First, try to find or create the city
      const cityResponse = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: place.name,
          address: place.address,
          latitude: place.lat,
          longitude: place.lng,
          placeId: place.placeId,
          country: country,
        }),
      })

      if (!cityResponse.ok) {
        const errorData = await cityResponse.json()
        console.error('Failed to create city:', errorData)
        alert('Failed to add destination. Please try again.')
        return
      }

      const cityData = await cityResponse.json()
      const cityId = cityData.city?.id

      if (!cityId) {
        console.error('Failed to create or find city')
        alert('Failed to add destination. Please try again.')
        return
      }

      // Get trip info
      const tripResponse = await fetch(`/api/trips/${tripId}`)
      const tripData = await tripResponse.json()
      const trip = tripData.trip

      const arrivalDate = stops.length === 0
        ? trip.startDate
        : new Date(stops[stops.length - 1].departureDate)

      const departureDate = new Date(arrivalDate)
      departureDate.setDate(departureDate.getDate() + 2)

      // Add the city as a stop
      const response = await fetch(`/api/trips/${tripId}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId,
          arrivalDate: arrivalDate.toISOString(),
          departureDate: departureDate.toISOString(),
        }),
      })

      if (response.ok) {
        await fetchStops()
        setShowCitySearch(false)
        setSearchQuery('')
        setCities([])
      } else {
        const errorData = await response.json()
        console.error('Failed to add stop:', errorData)
        alert('Failed to add destination to trip. Please try again.')
      }
    } catch (error) {
      console.error('Error adding place:', error)
      alert('An error occurred while adding the destination. Please try again.')
    }
  }

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Remove this destination from your trip?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/stops/${stopId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchStops()
      }
    } catch (error) {
      console.error('Error deleting stop:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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

  return (
    <Layout>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
              Build Your Itinerary
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Add cities and organize your trip timeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowCarRental(true)
                fetchAvailableCars()
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">directions_car</span>
              Car Rental
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                showMap
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-lg">map</span>
              {showMap ? 'Hide Map' : 'Show Map'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/trips/${tripId}`)}
              className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/30"
            >
              Done
            </motion.button>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${showMap ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
          {/* Main Timeline Column */}
          <div className={`${showMap ? 'lg:col-span-2' : 'lg:col-span-1'} flex flex-col gap-6`}>
            {/* Add City Search */}
            {showCitySearch && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add City</h3>
                  <button
                    onClick={() => {
                      setShowCitySearch(false)
                      setSearchQuery('')
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Google Places Autocomplete */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Search with Google Maps
                    </label>
                    <GooglePlacesAutocomplete
                      onPlaceSelect={handlePlaceSelect}
                      placeholder="Search for any destination worldwide..."
                      className="w-full"
                    />
                  </div>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">Or search from database</span>
                    </div>
                  </div>

                  {/* Database Search */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400">search</span>
                    </div>
                    <input
                      className="w-full h-12 pl-12 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Search for a city in database..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchCities(e.target.value)
                      }}
                    />
                  </div>
                </div>
                {cities.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                    {cities.map((city) => (
                      <motion.div
                        key={city.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddCity(city.id)}
                        className="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        {city.imageUrl && (
                          <Image
                            src={city.imageUrl}
                            alt={city.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">{city.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{city.country}</p>
                        </div>
                        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                          Add
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Timeline */}
            {stops.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800"
              >
                <div className="text-6xl mb-4">🌍</div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">No destinations added yet</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCitySearch(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/30"
                >
                  Add Your First Destination
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {stops.map((stop, index) => (
                  <motion.div
                    key={stop.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Timeline Connector */}
                    {index < stops.length - 1 && (
                      <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                    )}

                    {/* Stop Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div className="flex gap-4 p-6">
                        {/* Timeline Dot */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="size-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                            {index + 1}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                {stop.city.name}, {stop.city.country}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-base">calendar_today</span>
                                  {formatDate(stop.arrivalDate)} - {formatDate(stop.departureDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-base">schedule</span>
                                  {getDaysBetween(stop.arrivalDate, stop.departureDate)} {getDaysBetween(stop.arrivalDate, stop.departureDate) === 1 ? 'day' : 'days'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push(`/trips/${tripId}/stops/${stop.id}/activities`)}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Activities
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteStop(stop.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </motion.button>
                            </div>
                          </div>

                          {stop.city.imageUrl && (
                            <div className="relative h-48 w-full rounded-lg overflow-hidden mb-3">
                              <Image
                                src={stop.city.imageUrl}
                                alt={stop.city.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          {stop.activities.length > 0 && (
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                {stop.activities.length} {stop.activities.length === 1 ? 'Activity' : 'Activities'} Planned
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {stop.activities.slice(0, 3).map((activity) => (
                                  <span
                                    key={activity.id}
                                    className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                  >
                                    {activity.name}
                                  </span>
                                ))}
                                {stop.activities.length > 3 && (
                                  <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    +{stop.activities.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add Next City Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCitySearch(true)}
                  className="w-full h-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-2xl">add_circle</span>
                  <span className="font-semibold">Add Next City</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Map Widget Sidebar */}
          {showMap && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white">Route Map</h3>
                  <button
                    onClick={() => setShowMap(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="p-4">
                  <GoogleMap
                    markers={stops
                      .filter(stop => stop.city.latitude && stop.city.longitude)
                      .map((stop, index) => ({
                        id: stop.id,
                        name: stop.city.name,
                        lat: stop.city.latitude || 0,
                        lng: stop.city.longitude || 0,
                        order: index + 1,
                        type: 'city' as const,
                      }))}
                    route={true}
                    height="400px"
                  />
                </div>
                <div className="p-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
                  {stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {stop.city.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(stop.arrivalDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </div>
      </main>

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
                  Car Rentals for Your Trip
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
    </Layout>
  )
}
