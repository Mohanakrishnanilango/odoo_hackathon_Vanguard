'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'

interface City {
  id: string
  name: string
  country: string
  countryCode: string
  costIndex: number
  popularity: number
  description?: string
  imageUrl?: string
}

export default function CityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedCities, setRelatedCities] = useState<City[]>([])

  useEffect(() => {
    fetchCityDetails()
    fetchRelatedCities()
  }, [params.id])

  const fetchCityDetails = async () => {
    try {
      const response = await fetch('/api/cities')
      const data = await response.json()
      const cities = data.cities || []
      const cityData = cities.find((c: City) => c.id === params.id)
      setCity(cityData || null)
    } catch (error) {
      console.error('Error fetching city details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedCities = async () => {
    try {
      const response = await fetch('/api/cities?limit=6')
      const data = await response.json()
      const cities = data.cities || []
      const related = cities.filter((c: City) => c.id !== params.id).slice(0, 4)
      setRelatedCities(related)
    } catch (error) {
      console.error('Error fetching related cities:', error)
    }
  }

  const handleAddToTrip = () => {
    if (city) {
      const selectedCities = JSON.parse(localStorage.getItem('selectedCities') || '[]')
      if (!selectedCities.includes(city.id)) {
        selectedCities.push(city.id)
        localStorage.setItem('selectedCities', JSON.stringify(selectedCities))
      }
      router.push('/trips/new')
    }
  }

  const handleBookmark = () => {
    if (city) {
      const bookmarkedCities = JSON.parse(localStorage.getItem('bookmarkedCities') || '[]')
      if (!bookmarkedCities.includes(city.id)) {
        bookmarkedCities.push(city.id)
        localStorage.setItem('bookmarkedCities', JSON.stringify(bookmarkedCities))
        alert('City bookmarked successfully!')
      } else {
        const index = bookmarkedCities.indexOf(city.id)
        bookmarkedCities.splice(index, 1)
        localStorage.setItem('bookmarkedCities', JSON.stringify(bookmarkedCities))
        alert('City removed from bookmarks!')
      }
    }
  }

  const isBookmarked = () => {
    if (!city) return false
    const bookmarkedCities = JSON.parse(localStorage.getItem('bookmarkedCities') || '[]')
    return bookmarkedCities.includes(city.id)
  }

  const getCostLabel = (costIndex: number) => {
    const dailyCostUSD = costIndex * 5 + 200
    const dailyCostINR = dailyCostUSD * 83
    if (costIndex < 30) return `₹${Math.round(dailyCostINR).toLocaleString('en-IN')}/day`
    if (costIndex < 60) return `₹${Math.round(dailyCostINR).toLocaleString('en-IN')}/day`
    if (costIndex < 80) return `₹${Math.round(dailyCostINR).toLocaleString('en-IN')}/day`
    return `₹${Math.round(dailyCostINR).toLocaleString('en-IN')}/day`
  }

  const getSeasonInfo = () => {
    const month = new Date().getMonth()
    if (month >= 3 && month <= 5) return { season: 'Spring', temp: '15-25°C', activities: ['Sightseeing', 'Outdoor cafes', 'Parks'] }
    if (month >= 6 && month <= 8) return { season: 'Summer', temp: '25-35°C', activities: ['Beaches', 'Outdoor dining', 'Festivals'] }
    if (month >= 9 && month <= 11) return { season: 'Autumn', temp: '10-20°C', activities: ['Fall foliage', 'Museums', 'Local markets'] }
    return { season: 'Winter', temp: '5-15°C', activities: ['Indoor attractions', 'Hot springs', 'Cultural events'] }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    )
  }

  if (!city) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">City Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">The city you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/cities')}>Back to Cities</Button>
          </div>
        </div>
      </Layout>
    )
  }

  const season = getSeasonInfo()

  return (
    <Layout>
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-96 rounded-2xl overflow-hidden mb-8"
        >
          {city.imageUrl ? (
            <Image
              src={city.imageUrl}
              alt={city.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-2"
            >
              {city.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl opacity-90"
            >
              {city.country}
            </motion.p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About {city.name}</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {city.description || `Discover the beauty and culture of ${city.name}, a stunning destination in ${city.country}.`}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cost Index</h3>
                  <p className="text-2xl font-bold text-primary">{getCostLabel(city.costIndex)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Popularity</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.floor(city.popularity / 20)
                              ? 'bg-amber-400'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{city.popularity}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToTrip}
                  className="flex-1 bg-primary hover:bg-blue-600"
                >
                  <span className="material-symbols-outlined mr-2">add</span>
                  Add to Trip
                </Button>
                <Button
                  onClick={handleBookmark}
                  variant={isBookmarked() ? 'secondary' : 'outline'}
                  className="flex-1"
                >
                  <span className="material-symbols-outlined mr-2">
                    {isBookmarked() ? 'bookmark' : 'bookmark_border'}
                  </span>
                  {isBookmarked() ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>
            </motion.div>

            {/* Season Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Current Season</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{season.season}</h3>
                  <p className="text-3xl font-bold text-primary mb-2">{season.temp}</p>
                  <p className="text-slate-600 dark:text-slate-400">Average Temperature</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Popular Activities</h3>
                  <ul className="space-y-2">
                    {season.activities.map((activity, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Country</span>
                  <span className="font-medium text-slate-900 dark:text-white">{city.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Country Code</span>
                  <span className="font-medium text-slate-900 dark:text-white">{city.countryCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Best Time to Visit</span>
                  <span className="font-medium text-slate-900 dark:text-white">Year-round</span>
                </div>
              </div>
            </motion.div>

            {/* Related Cities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Related Cities</h3>
              <div className="space-y-3">
                {relatedCities.map((relatedCity, index) => (
                  <motion.div
                    key={relatedCity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push(`/cities/${relatedCity.id}`)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {relatedCity.imageUrl ? (
                        <Image
                          src={relatedCity.imageUrl}
                          alt={relatedCity.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{relatedCity.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{relatedCity.country}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </Layout>
  )
}
