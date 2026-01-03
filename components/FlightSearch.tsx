'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FlightSearchProps {
  onSearch: (searchData: FlightSearchData) => void
  loading?: boolean
}

export interface FlightSearchData {
  tripType: 'roundTrip' | 'oneWay' | 'multiCity'
  from: string
  to: string
  departureDate: string
  returnDate?: string
  travelers: {
    adults: number
    children: number
    infants: number
  }
  classType: 'economy' | 'business' | 'first'
  directFlightsOnly: boolean
}

export default function FlightSearch({ onSearch, loading = false }: FlightSearchProps) {
  const [searchData, setSearchData] = useState<FlightSearchData>({
    tripType: 'roundTrip',
    from: 'Coimbatore (CJB)',
    to: 'Chennai (MAA)',
    departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    travelers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    classType: 'economy',
    directFlightsOnly: false
  })

  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false)

  const handleInputChange = (field: keyof FlightSearchData, value: any) => {
    const newData = { ...searchData, [field]: value }
    
    // Reset return date if changing to one way
    if (field === 'tripType' && value === 'oneWay') {
      newData.returnDate = ''
    }
    
    setSearchData(newData)
  }

  const handleTravelerChange = (type: 'adults' | 'children' | 'infants', delta: number) => {
    const newTravelers = { ...searchData.travelers }
    const currentValue = newTravelers[type]
    const newValue = Math.max(0, Math.min(9, currentValue + delta))
    
    // Ensure at least 1 adult
    if (type === 'adults' && newValue === 0) {
      return
    }
    
    newTravelers[type] = newValue
    setSearchData({ ...searchData, travelers: newTravelers })
  }

  const getTotalTravelers = () => {
    return searchData.travelers.adults + searchData.travelers.children + searchData.travelers.infants
  }

  const getTravelerSummary = () => {
    const parts = []
    if (searchData.travelers.adults > 0) {
      parts.push(`${searchData.travelers.adults} Adult${searchData.travelers.adults > 1 ? 's' : ''}`)
    }
    if (searchData.travelers.children > 0) {
      parts.push(`${searchData.travelers.children} Child${searchData.travelers.children > 1 ? 'ren' : ''}`)
    }
    if (searchData.travelers.infants > 0) {
      parts.push(`${searchData.travelers.infants} Infant${searchData.travelers.infants > 1 ? 's' : ''}`)
    }
    return parts.join(', ')
  }

  const handleSwapLocations = () => {
    setSearchData({
      ...searchData,
      from: searchData.to,
      to: searchData.from
    })
  }

  const handleSearch = () => {
    if (!searchData.from || !searchData.to || !searchData.departureDate) {
      alert('Please fill in all required fields')
      return
    }
    
    if (searchData.tripType === 'roundTrip' && !searchData.returnDate) {
      alert('Please select a return date for round trip')
      return
    }
    
    onSearch(searchData)
  }

  const getClassLabel = (classType: string) => {
    switch (classType) {
      case 'economy': return 'Economy'
      case 'business': return 'Business'
      case 'first': return 'First Class'
      default: return classType
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      {/* Trip Type Selection */}
      <div className="flex gap-6 mb-5 border-b border-slate-100 dark:border-slate-700 pb-2">
        {(['roundTrip', 'oneWay', 'multiCity'] as const).map((type) => (
          <label key={type} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="tripType"
              checked={searchData.tripType === type}
              onChange={() => handleInputChange('tripType', type)}
              className="text-primary focus:ring-primary dark:bg-slate-700 border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition">
              {type === 'roundTrip' ? 'Round Trip' : type === 'oneWay' ? 'One Way' : 'Multi-City'}
            </span>
          </label>
        ))}
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* From */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            From
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">
              flight_takeoff
            </span>
            <input
              type="text"
              placeholder="City or Airport"
              value={searchData.from}
              onChange={(e) => handleInputChange('from', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwapLocations}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
              swap_vert
            </span>
          </motion.button>
        </div>

        {/* To */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            To
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">
              flight_land
            </span>
            <input
              type="text"
              placeholder="City or Airport"
              value={searchData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Dates
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">
              calendar_month
            </span>
            <input
              type="date"
              placeholder="Select departure date"
              value={searchData.departureDate}
              onChange={(e) => handleInputChange('departureDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition cursor-pointer"
            />
            {searchData.tripType === 'roundTrip' && (
              <input
                type="date"
                placeholder="Select return date"
                value={searchData.returnDate || ''}
                onChange={(e) => handleInputChange('returnDate', e.target.value)}
                min={searchData.departureDate || new Date().toISOString().split('T')[0]}
                className="w-full mt-2 pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Travelers & Class */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Travelers & Class
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">
              group
            </span>
            <button
              onClick={() => setShowTravelerDropdown(!showTravelerDropdown)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer text-left"
            >
              {getTotalTravelers()} {getTotalTravelers() === 1 ? 'Traveler' : 'Travelers'}, {getClassLabel(searchData.classType)}
            </button>
            
            {/* Traveler Dropdown */}
            {showTravelerDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 p-4"
              >
                <div className="space-y-3">
                  {(['adults', 'children', 'infants'] as const).map((type) => (
                    <div key={type} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                          {type === 'adults' ? 'Adults' : type === 'children' ? 'Children' : 'Infants'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {type === 'adults' ? '12+ years' : type === 'children' ? '2-11 years' : 'Under 2 years'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTravelerChange(type, -1)}
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-8 text-center font-medium">{searchData.travelers[type]}</span>
                        <button
                          onClick={() => handleTravelerChange(type, 1)}
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Class Selection */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Class
                  </p>
                  <div className="space-y-1">
                    {(['economy', 'business', 'first'] as const).map((classType) => (
                      <label key={classType} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="classType"
                          checked={searchData.classType === classType}
                          onChange={() => handleInputChange('classType', classType)}
                          className="text-primary focus:ring-primary dark:bg-slate-700 border-slate-300"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {getClassLabel(classType)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="md:col-span-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={loading}
            className="w-full h-[46px] bg-primary hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg shadow-md flex items-center justify-center transition"
          >
            {loading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <span className="material-symbols-outlined">search</span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Additional Options */}
      <div className="mt-4 flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchData.directFlightsOnly}
            onChange={(e) => handleInputChange('directFlightsOnly', e.target.checked)}
            className="text-primary focus:ring-primary dark:bg-slate-700 border-slate-300 rounded"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Direct flights only</span>
        </label>
      </div>
    </div>
  )
}
