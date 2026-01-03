'use client'

import { useEffect, useRef, useState } from 'react'

interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  order?: number
  type?: 'city' | 'activity' | 'hotel'
}

interface GoogleMapProps {
  markers: MapMarker[]
  route?: boolean
  height?: string
  className?: string
  center?: { lat: number; lng: number }
  zoom?: number
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function GoogleMap({ 
  markers, 
  route = false, 
  height = '400px', 
  className = '',
  center,
  zoom
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const API_KEY = 'AIzaSyD-cVF7cb-pD24N6RP4PKB777loGHqvcHk'

  // Load Google Maps script
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return

    const validMarkers = markers.filter(m => m.lat !== 0 && m.lng !== 0 && m.lat && m.lng)
    
    // Calculate center if not provided
    let mapCenter: { lat: number; lng: number }
    if (validMarkers.length === 0) {
      // Default center if no markers
      mapCenter = center || { lat: 0, lng: 0 }
    } else {
      mapCenter = center || {
        lat: validMarkers.reduce((sum, m) => sum + m.lat, 0) / validMarkers.length,
        lng: validMarkers.reduce((sum, m) => sum + m.lng, 0) / validMarkers.length,
      }
    }

    const mapZoom = zoom || (validMarkers.length === 1 ? 12 : validMarkers.length === 0 ? 2 : 6)

    // Always create a new map instance to avoid stale state
    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    })

    setMap(googleMap)

    // Add markers
    const googleMarkers: any[] = []
    validMarkers.forEach((marker, index) => {
      const markerIcon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }

      const googleMarker = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: googleMap,
        title: marker.name,
        icon: markerIcon,
        label: {
          text: (marker.order || index + 1).toString(),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      })

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${marker.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${marker.type || 'Location'}</p>
          </div>
        `,
      })

      googleMarker.addListener('click', () => {
        infoWindow.open(googleMap, googleMarker)
      })

      googleMarkers.push(googleMarker)
    })

    // Draw route if multiple markers
    let directionsRenderer: any = null
    if (route && validMarkers.length > 1 && validMarkers.length > 0) {
      const directionsService = new window.google.maps.DirectionsService()
      directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: googleMap,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      })

      const waypoints = validMarkers.slice(1, -1).map(marker => ({
        location: { lat: marker.lat, lng: marker.lng },
        stopover: true,
      }))

      directionsService.route(
        {
          origin: { lat: validMarkers[0].lat, lng: validMarkers[0].lng },
          destination: { lat: validMarkers[validMarkers.length - 1].lat, lng: validMarkers[validMarkers.length - 1].lng },
          waypoints: waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === 'OK' && result && directionsRenderer) {
            directionsRenderer.setDirections(result)
          }
        }
      )
    }

    // Fit bounds to show all markers
    if (validMarkers.length > 1 && !route) {
      const bounds = new window.google.maps.LatLngBounds()
      validMarkers.forEach(marker => {
        bounds.extend({ lat: marker.lat, lng: marker.lng })
      })
      googleMap.fitBounds(bounds)
    }

    return () => {
      googleMarkers.forEach(marker => marker.setMap(null))
      if (directionsRenderer) {
        directionsRenderer.setMap(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, markers, route, center, zoom])

  return (
    <div className={`relative rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 ${className}`} style={{ height, width: '100%' }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ width: '100%', height: '100%', minHeight: height }} />
      
      {/* Info overlay */}
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between text-slate-900 dark:text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary">pin_drop</span>
                <span className="text-sm font-semibold">
                  {markers.length} {markers.length === 1 ? 'Location' : 'Locations'}
                </span>
              </div>
              {route && markers.length > 1 && (
                <div className="text-xs opacity-90">
                  {markers.map(m => m.name).join(' → ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
