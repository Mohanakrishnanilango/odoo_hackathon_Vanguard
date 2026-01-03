'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Trip {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  stops: Array<{
    id: string
    city: {
      name: string
      country: string
    }
    arrivalDate: string
    departureDate: string
    activities: Array<{
      id: string
      name: string
      cost: number
      duration: number
    }>
  }>
  user: {
    name?: string
  }
}

export default function SharedItineraryPage() {
  const params = useParams()
  const token = params.token as string
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSharedTrip()
  }, [token])

  const fetchSharedTrip = async () => {
    try {
      const response = await fetch(`/api/shared/${token}`)
      const data = await response.json()
      setTrip(data.trip)
    } catch (error) {
      console.error('Error fetching shared trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </Layout>
    )
  }

  if (!trip) {
    return (
      <Layout>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Shared itinerary not found</p>
          </CardContent>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
            <p className="text-gray-600 mt-2">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </p>
            {trip.user.name && (
              <p className="text-sm text-gray-500 mt-1">
                Shared by {trip.user.name}
              </p>
            )}
          </div>
          <Button onClick={handleCopyLink}>Copy Link</Button>
        </div>

        {trip.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{trip.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trip.stops.map((stop, index) => (
                <div key={stop.id} className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-lg">
                    {index + 1}. {stop.city.name}, {stop.city.country}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(stop.arrivalDate)} - {formatDate(stop.departureDate)}
                  </p>
                  {stop.activities.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Activities:</p>
                      {stop.activities.map((activity) => (
                        <div key={activity.id} className="ml-4 text-sm text-gray-600">
                          • {activity.name} (${activity.cost}, {activity.duration} min)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

