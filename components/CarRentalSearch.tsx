'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface CarRentalSearchProps {
  onSearch: (filters: CarFilters) => void
  loading?: boolean
}

export interface CarFilters {
  location: string
  pickupDate: string
  returnDate: string
  carType: string[]
  transmission: string[]
  fuel: string[]
  priceRange: [number, number]
  features: string[]
}

export default function CarRentalSearch({ onSearch, loading = false }: CarRentalSearchProps) {
  const [filters, setFilters] = useState<CarFilters>({
    location: '',
    pickupDate: '',
    returnDate: '',
    carType: [],
    transmission: [],
    fuel: [],
    priceRange: [0, 500],
    features: []
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const carTypes = [
    { value: 'economy', label: 'Economy', icon: 'savings' },
    { value: 'compact', label: 'Compact', icon: 'directions_car' },
    { value: 'midsize', label: 'Mid-size', icon: 'directions_car' },
    { value: 'suv', label: 'SUV', icon: 'airport_shuttle' },
    { value: 'luxury', label: 'Luxury', icon: 'diamond' }
  ]

  const transmissions = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' }
  ]

  const fuelTypes = [
    { value: 'gasoline', label: 'Gasoline' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' }
  ]

  const commonFeatures = [
    'GPS', 'Bluetooth', 'USB', 'Cruise Control', 'Parking Sensors',
    'Backup Camera', 'Climate Control', 'Leather Seats', 'Sunroof'
  ]

  const handleFilterChange = (key: keyof CarFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const handleMultiSelect = (key: keyof CarFilters, value: string) => {
    const currentValues = filters[key] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    handleFilterChange(key, newValues)
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleReset = () => {
    const defaultFilters: CarFilters = {
      location: '',
      pickupDate: '',
      returnDate: '',
      carType: [],
      transmission: [],
      fuel: [],
      priceRange: [0, 500],
      features: []
    }
    setFilters(defaultFilters)
    onSearch(defaultFilters)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Pickup Location
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              location_on
            </span>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City or Airport"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Pickup Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Pickup Date
          </label>
          <input
            type="date"
            value={filters.pickupDate}
            onChange={(e) => handleFilterChange('pickupDate', e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Return Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Return Date
          </label>
          <input
            type="date"
            value={filters.returnDate}
            onChange={(e) => handleFilterChange('returnDate', e.target.value)}
            min={filters.pickupDate}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Search Button */}
        <div className="flex items-end gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">search</span>
            {loading ? 'Searching...' : 'Search'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Reset
          </motion.button>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {filters.location && 'Location: ' + filters.location}
          {filters.pickupDate && filters.returnDate && 
            ` • ${filters.pickupDate} to ${filters.returnDate}`
          }
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-primary hover:text-blue-600 text-sm font-medium flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-lg">
            {showAdvanced ? 'expand_less' : 'expand_more'}
          </span>
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </motion.button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800"
        >
          {/* Car Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Car Type
            </label>
            <div className="flex flex-wrap gap-2">
              {carTypes.map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMultiSelect('carType', type.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    filters.carType.includes(type.value)
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{type.icon}</span>
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Transmission
            </label>
            <div className="flex flex-wrap gap-2">
              {transmissions.map((transmission) => (
                <motion.button
                  key={transmission.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMultiSelect('transmission', transmission.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.transmission.includes(transmission.value)
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {transmission.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Fuel Type
            </label>
            <div className="flex flex-wrap gap-2">
              {fuelTypes.map((fuel) => (
                <motion.button
                  key={fuel.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMultiSelect('fuel', fuel.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    filters.fuel.includes(fuel.value)
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {fuel.value === 'electric' || fuel.value === 'hybrid' ? 'electric_car' : 'local_gas_station'}
                  </span>
                  {fuel.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Price Range per Day
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonFeatures.map((feature) => (
                <motion.button
                  key={feature}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMultiSelect('features', feature)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    filters.features.includes(feature)
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {feature}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
