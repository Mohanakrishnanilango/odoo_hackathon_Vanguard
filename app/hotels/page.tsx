'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/currency'

interface Hotel {
  id: string
  name: string
  city: string
  country: string
  address: string
  rating: number
  pricePerNight: number
  imageUrl: string
  amenities: string[]
  description: string
  available: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

export default function HotelsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '2',
    minPrice: '',
    maxPrice: '',
    rating: '',
  })

  const sampleHotels: Hotel[] = [
    {
      id: '1',
      name: 'Grand Plaza Hotel',
      city: 'Paris',
      country: 'France',
      address: '123 Champs-Élysées, Paris',
      rating: 4.5,
      pricePerNight: 150,
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking'],
      description: 'Luxurious hotel in the heart of Paris with stunning city views.',
      available: true,
    },
    {
      id: '2',
      name: 'Tokyo Skyline Resort',
      city: 'Tokyo',
      country: 'Japan',
      address: '456 Shibuya District, Tokyo',
      rating: 4.8,
      pricePerNight: 200,
      imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      amenities: ['WiFi', 'Gym', 'Restaurant', 'Room Service', 'Concierge'],
      description: 'Modern hotel with panoramic views of Tokyo skyline.',
      available: true,
    },
    {
      id: '3',
      name: 'London Heritage Inn',
      city: 'London',
      country: 'United Kingdom',
      address: '789 Westminster, London',
      rating: 4.3,
      pricePerNight: 120,
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      amenities: ['WiFi', 'Breakfast', 'Bar', 'Business Center'],
      description: 'Charming historic hotel near major attractions.',
      available: true,
    },
    {
      id: '4',
      name: 'Barcelona Beachfront',
      city: 'Barcelona',
      country: 'Spain',
      address: '321 La Rambla, Barcelona',
      rating: 4.6,
      pricePerNight: 110,
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      amenities: ['WiFi', 'Beach Access', 'Pool', 'Restaurant', 'Spa'],
      description: 'Beachfront hotel with Mediterranean views and modern amenities.',
      available: true,
    },
    {
      id: '5',
      name: 'Rome Colosseum View',
      city: 'Rome',
      country: 'Italy',
      address: '654 Via dei Fori Imperiali, Rome',
      rating: 4.7,
      pricePerNight: 180,
      imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800',
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Tour Desk'],
      description: 'Elegant hotel with views of the Colosseum and Roman Forum.',
      available: true,
    },
    {
      id: '6',
      name: 'New York Central',
      city: 'New York',
      country: 'United States',
      address: '987 Broadway, New York',
      rating: 4.4,
      pricePerNight: 250,
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
      amenities: ['WiFi', 'Gym', 'Restaurant', 'Business Center', 'Concierge'],
      description: 'Stylish hotel in the heart of Manhattan.',
      available: true,
    },
  ]

  useEffect(() => {
    searchHotels()
  }, [filters])

  const searchHotels = () => {
    setLoading(true)
    setTimeout(() => {
      let filtered = sampleHotels

      if (filters.city) {
        filtered = filtered.filter(h => 
          h.city.toLowerCase().includes(filters.city.toLowerCase()) ||
          h.country.toLowerCase().includes(filters.city.toLowerCase())
        )
      }

      // Price filters are in INR, but hotel prices are in USD, so convert
      if (filters.minPrice) {
        const minPriceUSD = parseFloat(filters.minPrice) / 83 // Convert INR to USD
        filtered = filtered.filter(h => h.pricePerNight >= minPriceUSD)
      }

      if (filters.maxPrice) {
        const maxPriceUSD = parseFloat(filters.maxPrice) / 83 // Convert INR to USD
        filtered = filtered.filter(h => h.pricePerNight <= maxPriceUSD)
      }

      if (filters.rating) {
        filtered = filtered.filter(h => h.rating >= parseFloat(filters.rating))
      }

      setHotels(filtered)
      setLoading(false)
    }, 500)
  }

  const handleBook = (hotel: Hotel) => {
    const params = new URLSearchParams({
      hotelId: hotel.id,
      hotelName: hotel.name,
      city: hotel.city,
      checkIn: filters.checkIn || new Date().toISOString().split('T')[0],
      checkOut: filters.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests: filters.guests,
    })
    router.push(`/hotels/booking?${params.toString()}`)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Find Your Perfect Stay
          </h1>
          <p className="text-gray-600">Search and book hotels worldwide</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Search Hotels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="City or Country"
                  placeholder="Paris, Tokyo..."
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
                <Input
                  label="Check-in"
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
                />
                <Input
                  label="Check-out"
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
                />
                <Input
                  label="Guests"
                  type="number"
                  min="1"
                  max="10"
                  value={filters.guests}
                  onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Min Price (₹)"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
                <Input
                  label="Max Price (₹)"
                  type="number"
                  placeholder="500"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full mt-4" onClick={searchHotels}>
                  Search Hotels
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"
              ></motion.div>
            </motion.div>
          ) : hotels.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600">No hotels found matching your criteria</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center"
              >
                <h2 className="text-2xl font-bold text-gray-900">
                  {hotels.length} {hotels.length === 1 ? 'Hotel' : 'Hotels'} Found
                </h2>
              </motion.div>
              <div className="grid grid-cols-1 gap-6">
                {hotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="md:flex">
                        <motion.div
                          className="md:w-1/3 h-64 md:h-auto relative overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img
                            src={hotel.imageUrl}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </motion.div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <motion.h3
                                className="text-2xl font-bold text-gray-900 mb-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                {hotel.name}
                              </motion.h3>
                              <p className="text-gray-600 mb-2">{hotel.address}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <motion.span
                                      key={i}
                                      className={`text-lg ${
                                        i < Math.floor(hotel.rating)
                                          ? 'text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ delay: index * 0.1 + i * 0.05, type: 'spring' }}
                                    >
                                      ★
                                    </motion.span>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">({hotel.rating})</span>
                              </div>
                            </div>
                            <motion.div
                              className="text-right"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                            >
                              <p className="text-3xl font-bold text-primary-600">
                                {formatCurrency(hotel.pricePerNight, 'INR')}
                              </p>
                              <p className="text-sm text-gray-600">per night</p>
                            </motion.div>
                          </div>
                          <p className="text-gray-700 mb-4">{hotel.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hotel.amenities.map((amenity, idx) => (
                              <motion.span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 + idx * 0.05 }}
                                whileHover={{ scale: 1.1 }}
                              >
                                {amenity}
                              </motion.span>
                            ))}
                          </div>
                          <div className="flex gap-3">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                              <Button
                                variant="primary"
                                onClick={() => handleBook(hotel)}
                                disabled={!hotel.available}
                                className="w-full"
                              >
                                {hotel.available ? 'Book Now' : 'Not Available'}
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                onClick={() => router.push(`/hotels/${hotel.id}`)}
                              >
                                View Details
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}
