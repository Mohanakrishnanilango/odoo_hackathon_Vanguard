  'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  order?: number
}

interface MapProps {
  markers: MapMarker[]
  route?: boolean
  height?: string
  className?: string
  // optional center location to highlight or use as the location user entered
  center?: { lat: number; lng: number; name?: string }
  // callback when user wants to add the currently-entered/center location as a destination
  onAddDestination?: (m: { id: string; name: string; lat: number; lng: number }) => void
}

export default function Map({ markers, route = false, height = '400px', className = '', center, onAddDestination }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  // Generate map image URL based on markers
  const getMapImageUrl = () => {
    if (markers.length === 0) {
      return 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80'
    }

    // Filter out markers with invalid coordinates
    const validMarkers = markers.filter(m => m.lat !== 0 && m.lng !== 0 && m.lat && m.lng)
    
    if (validMarkers.length === 0) {
      return 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80'
    }

    // Calculate center point
    const centerLat = validMarkers.reduce((sum, m) => sum + m.lat, 0) / validMarkers.length
    const centerLng = validMarkers.reduce((sum, m) => sum + m.lng, 0) / validMarkers.length
    
    // Use a generic map image with route visualization
    // In production, you'd use a real mapping service like Google Maps, Mapbox, etc.
    return `https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80`
  }

  // when user clicks "Add destination" use the provided callback
  const handleAddCenter = () => {
    if (!center || !onAddDestination) return
    const id = `local-${Date.now()}`
    onAddDestination({ id, name: center.name || 'Destination', lat: center.lat, lng: center.lng })
  }

  return (
    <div className={`relative rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 ${className}`} style={{ height }}>
      <div className="absolute inset-0">
        <Image
          src={getMapImageUrl()}
          alt="Map showing destinations"
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback to a generic map image
            ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
      </div>
      
      {/* Markers Overlay */}
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">pin_drop</span>
              <span className="text-sm font-semibold">
                {markers.length} {markers.length === 1 ? 'Destination' : 'Destinations'}
              </span>
            </div>
            {route && markers.length > 1 && (
              <div className="text-xs opacity-90">
                {markers.map(m => m.name).join(' → ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive markers (for future enhancement) */}
      <div ref={mapRef} className="absolute inset-0 pointer-events-none">
        {markers.filter(m => m.lat !== 0 && m.lng !== 0 && m.lat && m.lng).map((marker, index) => {
          // Calculate position based on coordinates (simplified projection)
          const validMarkers = markers.filter(m => m.lat !== 0 && m.lng !== 0 && m.lat && m.lng)
          const minLat = Math.min(...validMarkers.map(m => m.lat))
          const maxLat = Math.max(...validMarkers.map(m => m.lat))
          const minLng = Math.min(...validMarkers.map(m => m.lng))
          const maxLng = Math.max(...validMarkers.map(m => m.lng))
          
          const latRange = maxLat - minLat || 1
          const lngRange = maxLng - minLng || 1
          
          const left = ((marker.lng - minLng) / lngRange) * 80 + 10
          const top = ((marker.lat - minLat) / latRange) * 80 + 10
          
          return (
            <div
              key={marker.id}
              className="absolute pointer-events-auto group"
              style={{
                left: `${Math.max(5, Math.min(95, left))}%`,
                top: `${Math.max(5, Math.min(95, top))}%`,
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-lg z-10">
                  {marker.order || index + 1}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-white dark:bg-slate-900 rounded text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-20">
                  {marker.name}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

