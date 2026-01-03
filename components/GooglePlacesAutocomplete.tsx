'use client'

import { useEffect, useRef, useState } from 'react'

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: {
    name: string
    address: string
    lat: number
    lng: number
    placeId?: string
  }) => void
  placeholder?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function GooglePlacesAutocomplete({
  onPlaceSelect,
  placeholder = 'Search for a destination...',
  className = '',
  value,
  onChange,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const API_KEY = 'AIzaSyD-cVF7cb-pD24N6RP4PKB777loGHqvcHk'

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)

    return () => {
      // Cleanup
    }
  }, [])

  // Initialize Autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['(cities)'],
      fields: ['place_id', 'name', 'formatted_address', 'geometry', 'address_components'],
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      
      if (!place.geometry || !place.geometry.location) {
        return
      }

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      
      // Extract city and country from address components
      let cityName = place.name
      let country = ''
      
      if (place.address_components) {
        for (const component of place.address_components) {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
            cityName = component.long_name
          }
          if (component.types.includes('country')) {
            country = component.long_name
          }
        }
      }

      onPlaceSelect({
        name: cityName,
        address: place.formatted_address || place.name,
        lat,
        lng,
        placeId: place.place_id,
      })

      // Clear input after selection
      if (inputRef.current) {
        inputRef.current.value = ''
        setInputValue('')
        if (onChange) onChange('')
      }
    })

    autocompleteRef.current = autocomplete

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onPlaceSelect, onChange])

  // Sync with controlled value
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value)
      if (inputRef.current) {
        inputRef.current.value = value
      }
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (onChange) onChange(newValue)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
        <span className="material-symbols-outlined">search</span>
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className="w-full h-12 pl-12 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />
      {!isLoaded && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}

