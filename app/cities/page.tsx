'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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

interface Country {
  name: string
  code: string
  cityCount: number
  imageUrl: string
}

export default function CitiesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cities, setCities] = useState<City[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedBudget, setSelectedBudget] = useState('Any')
  const [selectedPopularity, setSelectedPopularity] = useState('All')
  const [viewMode, setViewMode] = useState<'cities' | 'countries'>('cities')
  const [loading, setLoading] = useState(false)
  const [showAllCities, setShowAllCities] = useState(false)
  const [allCities, setAllCities] = useState<City[]>([])

  useEffect(() => {
    fetchCities()
    fetchCountries()
  }, [searchQuery, selectedCountry, selectedRegion, selectedBudget, selectedPopularity])

  const fetchCities = async () => {
    setLoading(true)
    try {
      // Fetch all cities first to get complete list
      const allResponse = await fetch('/api/cities?limit=1000')
      const allData = await allResponse.json()
      const allCitiesList = allData.cities || []
      setAllCities(allCitiesList)

      // Then apply filters
      let url = '/api/cities?'
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`
      if (selectedCountry) url += `country=${encodeURIComponent(selectedCountry)}&`
      url += 'limit=1000' // Increased limit to show all cities

      const response = await fetch(url)
      const data = await response.json()
      let filteredCities = data.cities || []
      
      // Apply client-side filters
      if (selectedBudget !== 'Any') {
        const budgetMap: Record<string, [number, number]> = {
          '$': [0, 30],
          '$$': [30, 60],
          '$$$': [60, 80],
          '$$$$': [80, 100],
        }
        const [min, max] = budgetMap[selectedBudget] || [0, 100]
        filteredCities = filteredCities.filter((city: City) => city.costIndex >= min && city.costIndex <= max)
      }

      if (selectedPopularity !== 'All') {
        const popularityMap: Record<string, [number, number]> = {
          'High': [80, 100],
          'Medium': [50, 80],
          'Low': [0, 50],
        }
        const [min, max] = popularityMap[selectedPopularity] || [0, 100]
        filteredCities = filteredCities.filter((city: City) => city.popularity >= min && city.popularity <= max)
      }

      // Ensure at least 20 cities are shown if no filters are applied
      if (!searchQuery && !selectedCountry && selectedBudget === 'Any' && selectedPopularity === 'All') {
        // Use all cities if available
        const allCities = allCitiesList.length > 0 ? allCitiesList : (data.cities || [])
        if (allCities.length > 0) {
          // Show at least 20 cities, or all if less than 20
          filteredCities = allCities.slice(0, Math.max(20, allCities.length))
        }
      }

      setCities(filteredCities)
    } catch (error) {
      console.error('Error fetching cities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/cities?limit=1000')
      const data = await response.json()
      const cityList = data.cities || []
      
      const countryMap = new Map<string, { count: number; code: string }>()
      cityList.forEach((city: City) => {
        const existing = countryMap.get(city.country) || { count: 0, code: city.countryCode }
        countryMap.set(city.country, {
          count: existing.count + 1,
          code: city.countryCode,
        })
      })

      const countryImageMap: Record<string, string> = {
        'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=400&fit=crop',
        'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=400&fit=crop',
        'United States': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=400&fit=crop',
        'United Kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=400&fit=crop',
        'Spain': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=400&fit=crop',
        'Italy': 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800&h=400&fit=crop',
        'Germany': 'https://images.unsplash.com/photo-1587330979470-3585ac3ac3cd?w=800&h=400&fit=crop',
        'Netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=400&fit=crop',
        'Greece': 'https://images.unsplash.com/photo-1603574670812-df7088f3a880?w=800&h=400&fit=crop',
        'Thailand': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=400&fit=crop',
        'Australia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
        'Canada': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=400&fit=crop',
        'Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop',
        'United Arab Emirates': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop',
        'India': 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&h=400&fit=crop',
        'China': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=400&fit=crop',
        'Portugal': 'https://images.unsplash.com/photo-1555881403-671f5857c63b?w=800&h=400&fit=crop',
        'Indonesia': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=400&fit=crop',
        'Turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7203?w=800&h=400&fit=crop',
        'Morocco': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800&h=400&fit=crop',
        'South Africa': 'https://images.unsplash.com/photo-1579532585413-8e5d4a7e6b4e?w=800&h=400&fit=crop',
        'Egypt': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800&h=400&fit=crop',
        'Singapore': 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop',
        'Malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=400&fit=crop',
        'Vietnam': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=400&fit=crop',
        'South Korea': 'https://images.unsplash.com/photo-1578645510449-e8b1c896bb56?w=800&h=400&fit=crop',
        'Mexico': 'https://images.unsplash.com/photo-1514890547357-2717063c2225?w=800&h=400&fit=crop',
        'Argentina': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop',
        'Chile': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
        'Peru': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop',
        'Iceland': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
        'Norway': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
        'Sweden': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
        'Denmark': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
        'Czech Republic': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=400&fit=crop',
        'Austria': 'https://images.unsplash.com/photo-1549144511-f099e777c147?w=800&h=400&fit=crop',
        'Switzerland': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop',
      }

      const countryList: Country[] = Array.from(countryMap.entries()).map(([name, data]) => ({
        name,
        code: data.code,
        cityCount: data.count,
        imageUrl: countryImageMap[name] || `https://source.unsplash.com/800x600/?${encodeURIComponent(name)}`,
      }))

      // Sort countries alphabetically for better UX
      setCountries(countryList.sort((a, b) => a.name.localeCompare(b.name)))
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName)
    setViewMode('cities')
  }

  const handleAddCityToTrip = (cityId: string) => {
    // Store selected city in localStorage for trip creation
    const selectedCities = JSON.parse(localStorage.getItem('selectedCities') || '[]')
    if (!selectedCities.includes(cityId)) {
      selectedCities.push(cityId)
      localStorage.setItem('selectedCities', JSON.stringify(selectedCities))
    }
    router.push('/trips/new')
  }

  const handleViewCityDetails = (city: City) => {
    // Store city details for detailed view
    localStorage.setItem('selectedCity', JSON.stringify(city))
    router.push(`/cities/${city.id}`)
  }

  const handleBookmarkCity = (cityId: string) => {
    const bookmarkedCities = JSON.parse(localStorage.getItem('bookmarkedCities') || '[]')
    if (!bookmarkedCities.includes(cityId)) {
      bookmarkedCities.push(cityId)
      localStorage.setItem('bookmarkedCities', JSON.stringify(bookmarkedCities))
      alert('City bookmarked successfully!')
    } else {
      const index = bookmarkedCities.indexOf(cityId)
      bookmarkedCities.splice(index, 1)
      localStorage.setItem('bookmarkedCities', JSON.stringify(bookmarkedCities))
      alert('City removed from bookmarks!')
    }
  }

  const isBookmarked = (cityId: string) => {
    const bookmarkedCities = JSON.parse(localStorage.getItem('bookmarkedCities') || '[]')
    return bookmarkedCities.includes(cityId)
  }

  const getCostLabel = (costIndex: number) => {
    // Convert cost index to approximate daily cost in USD, then to INR
    const dailyCostUSD = costIndex * 5 + 200 // Rough estimate: costIndex * 5 + base 200
    const dailyCostINR = dailyCostUSD * 83 // Convert to INR
    if (costIndex < 30) return `₹${Math.round(dailyCostINR).toLocaleString('en-IN')}/day`
    if (costIndex < 60) return `₹${Math.round(dailyCostINR).toLocaleString('en-IN')}/day`
    if (costIndex < 80) return `₹${Math.round(dailyCostINR).toLocaleString('en-IN')}/day`
    return `₹${Math.round(dailyCostINR).toLocaleString('en-IN')}/day`
  }

  const getCityBadge = (city: City) => {
    if (city.popularity >= 90) return { text: 'Trending Now', color: 'text-primary' }
    if (city.costIndex < 40) return { text: 'Best Value', color: 'text-emerald-600 dark:text-emerald-400' }
    if (city.name.includes('Bali') || city.name.includes('Beach')) return { text: 'Nature & Relax', color: 'text-teal-600 dark:text-teal-400' }
    if (city.name.includes('Paris') || city.name.includes('Rome')) return { text: 'Romance', color: 'text-purple-600 dark:text-purple-400' }
    if (city.name.includes('New York') || city.name.includes('Tokyo')) return { text: 'Urban Life', color: 'text-blue-600 dark:text-blue-400' }
    return { text: 'History', color: 'text-orange-600 dark:text-orange-400' }
  }

  return (
    <Layout>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Search Section */}
        <div className="flex flex-col gap-6 mb-8 max-w-4xl mx-auto">
          {/* Page Heading */}
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Add City to Trip
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Find your next destination by region, budget, or popularity
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full">
            <label className="relative flex items-center w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-primary">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="block w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="Search for a city (e.g., Tokyo, Paris)"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">Filters:</span>
            <button
              onClick={() => setSelectedRegion(selectedRegion === 'All' ? 'Europe' : 'All')}
              className={`flex items-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition-all ${
                selectedRegion !== 'All'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-200'
              }`}
            >
              Region: {selectedRegion}
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className={`flex items-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition-all appearance-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-200 ${
                  selectedCountry ? 'bg-primary text-white border-primary' : ''
                }`}
                style={{ paddingRight: '2.5rem' }}
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name} ({country.cityCount})
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[20px]">expand_more</span>
            </div>
            <button
              onClick={() => setSelectedBudget(selectedBudget === 'Any' ? '$' : selectedBudget === '$' ? '$$' : selectedBudget === '$$' ? '$$$' : selectedBudget === '$$$' ? '$$$$' : 'Any')}
              className={`flex items-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition-all ${
                selectedBudget !== 'Any'
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-200'
              }`}
            >
              Budget: {selectedBudget}
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
            <button
              onClick={() => setSelectedPopularity(selectedPopularity === 'All' ? 'High' : selectedPopularity === 'High' ? 'Medium' : selectedPopularity === 'Medium' ? 'Low' : 'All')}
              className={`flex items-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition-all ${
                selectedPopularity !== 'All'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-200'
              }`}
            >
              Popularity
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
            </div>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('cities')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'cities'
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Cities ({cities.length})
              </button>
              <button
                onClick={() => setViewMode('countries')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'countries'
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Countries ({countries.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {viewMode === 'cities' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              <div className="col-span-full text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
                ></motion.div>
              </div>
            ) : cities.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">No cities found</p>
              </div>
            ) : (
              cities.map((city, index) => {
                const badge = getCityBadge(city)
                return (
                  <motion.div
                    key={city.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg dark:hover:shadow-slate-900/20 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full aspect-video overflow-hidden">
                      {city.imageUrl ? (
                        <Image
                          src={city.imageUrl}
                          alt={city.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://source.unsplash.com/800x600/?${encodeURIComponent(city.name + ' ' + city.country)}`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600"></div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                          <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
                          {(city.popularity / 20).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${badge.color}`}>
                            {badge.text}
                          </p>
                          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
                            {city.name}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Cost Index</span>
                          <span className="text-slate-900 dark:text-white text-sm font-bold">
                            {getCostLabel(city.costIndex)}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                        {city.description || `Explore ${city.name}, a beautiful destination in ${city.country}.`}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">public</span>
                          {city.country}
                        </span>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBookmarkCity(city.id)}
                            className={`flex items-center justify-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium transition-colors ${
                              isBookmarked(city.id)
                                ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isBookmarked(city.id) ? 'bookmark' : 'bookmark_border'}
                            </span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewCityDetails(city)}
                            className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">info</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddCityToTrip(city.id)}
                            className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-sm shadow-primary/30"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Add to Trip
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {countries.map((country, index) => (
              <motion.div
                key={country.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCountryClick(country.name)}
                className="relative rounded-lg shadow-md overflow-hidden cursor-pointer group"
              >
                <Image
                  src={country.imageUrl}
                  alt={country.name}
                  width={800}
                  height={400}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-2xl font-bold">{country.name}</h3>
                  <p className="text-sm">{country.cityCount} cities</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Summary Footer */}
        <div className="mt-12 flex flex-col items-center justify-center pb-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
            Showing <span className="font-bold text-slate-900 dark:text-white">{cities.length}</span> cities from{' '}
            <span className="font-bold text-slate-900 dark:text-white">{countries.length}</span> countries
          </p>
          {viewMode === 'cities' && cities.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All available cities are displayed. Use filters to narrow down your search.
            </p>
          )}
          {viewMode === 'countries' && countries.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click on a country to see all cities in that destination.
            </p>
          )}
        </div>
      </main>
    </Layout>
  )
}
