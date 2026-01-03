'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import { formatCurrency } from '@/lib/currency'
import CarRentalList from '@/components/CarRentalList'
import FlightList from '@/components/FlightList'
import { EXCHANGE_RATE } from '@/lib/currency'

interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
  description?: string
  coverPhoto?: string
  _count: {
    stops: number
  }
}

interface TrendingCity {
  id: string
  name: string
  country: string
  imageUrl?: string
  popularity: number
  costIndex: number
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [trips, setTrips] = useState<any[]>([])
  const [trendingCities, setTrendingCities] = useState<any[]>([])
  const [carRentals, setCarRentals] = useState<any[]>([])
  const [flightBookings, setFlightBookings] = useState<any[]>([])
  const [rentalsLoading, setRentalsLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchTrips()
      fetchTrendingCities()
      fetchCarRentals()
      fetchFlightBookings()
    }
  }, [sessionStatus])

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips?upcoming=true')
      const data = await response.json()
      setTrips(data.trips || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingCities = async () => {
    try {
      const response = await fetch('/api/cities?limit=3')
      const data = await response.json()
      // Sort by popularity and take top 3
      setTrendingCities(data.cities.sort((a: TrendingCity, b: TrendingCity) => b.popularity - a.popularity).slice(0, 3))
    } catch (error) {
      console.error('Error fetching trending cities:', error)
    }
  }

  const fetchCarRentals = async () => {
    setRentalsLoading(true)
    try {
      // Fetch all car rentals for the user across all trips
      const response = await fetch('/api/car-rentals')
      const data = await response.json()
      setCarRentals(data.rentals || [])
    } catch (error) {
      console.error('Error fetching car rentals:', error)
    } finally {
      setRentalsLoading(false)
    }
  }

  const fetchFlightBookings = async () => {
    try {
      // Mock flight bookings data
      const mockBookings = [
        {
          id: 'BK001',
          bookingReference: 'FLABC123',
          flight: {
            airline: 'SpiceJet',
            flightNumber: 'SG524',
            departure: {
              airport: 'CJB',
              city: 'Coimbatore',
              time: '09:30',
              date: '2024-01-14',
              terminal: '1'
            },
            arrival: {
              airport: 'MAA',
              city: 'Chennai',
              time: '10:15',
              date: '2024-01-14',
              terminal: '1'
            },
            duration: '45m',
            stops: 0
          },
          passengers: [
            { name: 'Raja Rajan M', type: 'adult' }
          ],
          classType: 'economy',
          totalPrice: 2500,
          status: 'upcoming',
          paymentStatus: 'paid',
          bookingDate: '2024-01-01T10:00:00Z',
          additionalServices: {
            travelInsurance: true,
            extraBaggage: false,
            seatSelection: true
          },
          paymentMethod: 'card'
        },
        {
          id: 'BK002',
          bookingReference: 'FLXYZ789',
          flight: {
            airline: 'IndiGo',
            flightNumber: '6E7123',
            departure: {
              airport: 'CJB',
              city: 'Coimbatore',
              time: '14:45',
              date: '2024-01-14',
              terminal: '2'
            },
            arrival: {
              airport: 'MAA',
              city: 'Chennai',
              time: '15:30',
              date: '2024-01-14',
              terminal: '1'
            },
            duration: '45m',
            stops: 0
          },
          passengers: [
            { name: 'Raja Rajan M', type: 'adult' },
            { name: 'Guest User', type: 'adult' }
          ],
          classType: 'business',
          totalPrice: 8000,
          status: 'upcoming',
          paymentStatus: 'paid',
          bookingDate: '2024-01-05T14:30:00Z',
          additionalServices: {
            travelInsurance: true,
            extraBaggage: true,
            seatSelection: true
          },
          paymentMethod: 'upi'
        }
      ]
      setFlightBookings(mockBookings)
    } catch (error) {
      console.error('Error fetching flight bookings:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    const tripDate = new Date(dateString)
    const diffTime = tripDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const nextTrip = trips[0]
  const daysUntil = nextTrip ? getDaysUntil(nextTrip.startDate) : null

  if (sessionStatus === 'loading' || loading) {
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

  const totalDestinations = trips.reduce((sum, trip) => sum + trip._count.stops, 0)

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-10">
          {/* Page Header */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                Good Morning, {session?.user?.name?.split(' ')[0] || 'Traveler'} 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">
                You have {trips.length} upcoming {trips.length === 1 ? 'trip' : 'trips'} and {totalDestinations} saved {totalDestinations === 1 ? 'place' : 'places'}.
              </p>
            </div>
            <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/flights')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-600/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
              Book Flight
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/trips/new')}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Plan New Trip
            </motion.button>
          </div>
          </section>

          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Spend 2023</p>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  +10%
                </span>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{formatCurrency(3200, 'INR')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Upcoming Trips</p>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">Active</span>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{trips.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Saved Places</p>
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold px-2 py-1 rounded-md">Bucket List</span>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{totalDestinations}</p>
            </motion.div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column: Upcoming Trip & Recommendations */}
            <div className="lg:col-span-2 flex flex-col gap-10">
              {/* Next Trip Card */}
              {nextTrip && (
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Your Next Trip</h2>
                    <Link href={`/trips/${nextTrip.id}`} className="text-primary text-sm font-semibold hover:underline">
                      View Itinerary
                    </Link>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col md:flex-row group"
                  >
                    <div className="md:w-2/5 h-48 md:h-auto relative">
                      {nextTrip.coverPhoto ? (
                        <Image
                          src={nextTrip.coverPhoto}
                          alt={nextTrip.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 md:hidden"></div>
                      <div className="absolute bottom-4 left-4 z-20 md:hidden">
                        <h3 className="text-white font-bold text-xl">{nextTrip.name}</h3>
                        <p className="text-white/90 text-sm">{daysUntil} {daysUntil === 1 ? 'Day' : 'Days'} to go</p>
                      </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="hidden md:flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-2xl">{nextTrip.name}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                              {formatDate(nextTrip.startDate)} - {formatDate(nextTrip.endDate)}
                            </p>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
                            {daysUntil} {daysUntil === 1 ? 'Day' : 'Days'} Left
                          </div>
                        </div>
                        {/* Trip Details */}
                        <div className="space-y-4 mt-4 md:mt-0">
                          <div className="flex gap-4 items-start">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                              <span className="material-symbols-outlined">flight_takeoff</span>
                            </div>
                            <div>
                              <p className="text-slate-900 dark:text-white text-sm font-bold">Flight Details</p>
                              <p className="text-slate-500 dark:text-slate-400 text-xs">Check your booking confirmation</p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-start">
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg text-orange-500">
                              <span className="material-symbols-outlined">hotel</span>
                            </div>
                            <div>
                              <p className="text-slate-900 dark:text-white text-sm font-bold">Hotel Booking</p>
                              <p className="text-slate-500 dark:text-slate-400 text-xs">Check-in: {formatDate(nextTrip.startDate)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          View Tickets
                        </button>
                        <button
                          onClick={() => router.push(`/trips/${nextTrip.id}`)}
                          className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/25"
                        >
                          Manage Trip
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </section>
              )}

              {/* Quick Flight Booking */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Quick Flight Booking</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/flights')}
                    className="text-primary text-sm font-bold hover:underline"
                  >
                    Book More Flights
                  </motion.button>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Book Your Next Flight</h3>
                      <p className="text-blue-100 mb-4">Find the best deals on flights worldwide</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-lg">flight_takeoff</span>
                          <span>6+ Airlines</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-lg">location_on</span>
                          <span>100+ Routes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-lg">savings</span>
                          <span>Best Prices</span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/flights')}
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-50 transition-colors"
                    >
                      Search Flights
                    </motion.button>
                  </div>
                </motion.div>
              </section>

              {/* Trending Destinations */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Trending Destinations</h2>
                  <div className="flex gap-2">
                    <button className="size-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button className="size-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {trendingCities.map((city, index) => {
                    const rating = (city.popularity / 20).toFixed(1)
                    const reviews = Math.floor(city.popularity * 2.5)
                    const priceUSD = Math.floor(city.costIndex * 5 + 200)
                    return (
                      <motion.div
                        key={city.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.03 }}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/cities?search=${city.name}`)}
                      >
                        <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-3">
                          <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-red-500 hover:text-red-600 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[18px] block">favorite</span>
                          </div>
                          <Image
                            src={city.imageUrl || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800'}
                            alt={`${city.name}, ${city.country}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800'
                            }}
                          />
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-slate-900 shadow-sm">
                            Flights from {formatCurrency(priceUSD, 'INR')}
                          </div>
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                          {city.name}, {city.country}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-yellow-400 text-[16px]">star</span>
                          <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                            {rating} ({reviews} reviews)
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* Right Column: Recent & Quick Actions */}
            <div className="flex flex-col gap-8">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Recent Activity</h3>
                <div className="flex flex-col gap-4">
                  {trips.slice(0, 3).map((trip, index) => {
                    const hoursAgo = Math.floor(Math.random() * 24) + 1
                    return (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        onClick={() => router.push(`/trips/${trip.id}`)}
                        className="flex gap-4 items-center group cursor-pointer p-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        {trip.coverPhoto ? (
                          <div className="h-12 w-12 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${trip.coverPhoto})` }}></div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined">flight</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{trip.name}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs truncate">Trip • Edited {hoursAgo} {hoursAgo === 1 ? 'hour' : 'hours'} ago</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[20px]">arrow_forward</span>
                      </motion.div>
                    )
                  })}
                  {trips.length === 0 && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">No recent activity</p>
                  )}
                </div>
                <button className="w-full mt-4 text-center text-primary text-sm font-bold hover:underline py-2">
                  View All History
                </button>
              </motion.div>

              {/* Car Rentals */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold">Car Rentals</h3>
                  <button className="text-primary text-sm font-bold hover:underline">
                    View All
                  </button>
                </div>
                <CarRentalList
                  rentals={carRentals.slice(0, 3)}
                  loading={rentalsLoading}
                  currency="INR"
                  exchangeRate={EXCHANGE_RATE}
                  showActions={false}
                />
                {carRentals.length > 3 && (
                  <button className="w-full mt-4 text-center text-primary text-sm font-bold hover:underline py-2">
                    View All Rentals
                  </button>
                )}
              </motion.div>

              {/* Flight Bookings */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold">Flight Bookings</h3>
                  <Link href="/tickets" className="text-primary text-sm font-bold hover:underline">
                    View All
                  </Link>
                </div>
                <FlightList
                  bookings={flightBookings.slice(0, 2)}
                  loading={false}
                  currency="INR"
                  exchangeRate={EXCHANGE_RATE}
                  showActions={false}
                />
                {flightBookings.length > 2 && (
                  <Link href="/tickets" className="block w-full mt-4 text-center text-primary text-sm font-bold hover:underline py-2">
                    View All Tickets
                  </Link>
                )}
              </motion.div>

              {/* Weather Widget */}
              {nextTrip && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                >
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-20">partly_cloudy_day</span>
                  <div className="relative z-10">
                    <p className="text-sm font-medium opacity-90 mb-1">{nextTrip.name}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl font-bold">22°C</span>
                      <span className="material-symbols-outlined text-3xl">wb_sunny</span>
                    </div>
                    <div className="flex justify-between text-xs opacity-90 border-t border-white/20 pt-3">
                      {['Mon', 'Tue', 'Wed', 'Thu'].map((day, i) => (
                        <div key={day} className="flex flex-col items-center">
                          <span>{day}</span>
                          <span className="font-bold">{24 - i}°</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Invite Friend */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-indigo-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-indigo-100 dark:border-slate-700 flex flex-col items-center text-center"
              >
                <div className="size-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-3 text-primary">
                  <span className="material-symbols-outlined">group_add</span>
                </div>
                <h3 className="text-slate-900 dark:text-white text-base font-bold mb-1">Travel with Friends</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                  Invite friends to collaborate on your {nextTrip?.name || 'next'} itinerary.
                </p>
                <button className="text-primary bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 w-full transition-colors">
                  Invite Friends
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
