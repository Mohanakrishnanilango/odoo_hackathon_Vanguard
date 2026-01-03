'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { format, differenceInDays } from 'date-fns'

export default function HotelBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState({
    hotelName: searchParams.get('hotelName') || '',
    city: searchParams.get('city') || '',
    checkIn: searchParams.get('checkIn') || format(new Date(), 'yyyy-MM-dd'),
    checkOut: searchParams.get('checkOut') || format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
    guests: parseInt(searchParams.get('guests') || '2'),
    rooms: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  })

  const nights = differenceInDays(
    new Date(bookingData.checkOut),
    new Date(bookingData.checkIn)
  )
  const pricePerNight = 150 // This would come from the hotel data
  const totalPrice = pricePerNight * nights * bookingData.rooms
  const tax = totalPrice * 0.1
  const finalTotal = totalPrice + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate booking API call
    setTimeout(() => {
      alert('Booking confirmed! Check your email for confirmation details.')
      router.push('/dashboard')
      setLoading(false)
    }, 1500)
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your details and confirm your reservation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hotel</p>
                      <p className="font-semibold text-gray-900">{bookingData.hotelName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="font-semibold text-gray-900">{bookingData.city}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Check-in</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(bookingData.checkIn), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Check-out</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(bookingData.checkOut), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Guests</p>
                      <p className="font-semibold text-gray-900">{bookingData.guests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nights</p>
                      <p className="font-semibold text-gray-900">{nights}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={bookingData.firstName}
                      onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={bookingData.lastName}
                      onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Rooms
                    </label>
                    <select
                      value={bookingData.rooms}
                      onChange={(e) => setBookingData({ ...bookingData, rooms: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Any special requests or preferences..."
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ${pricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                  {bookingData.rooms > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{bookingData.rooms} rooms</span>
                      <span className="text-gray-600">×{bookingData.rooms}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2 text-sm text-gray-600">
                    <p>✓ Free cancellation until 24 hours before check-in</p>
                    <p>✓ No prepayment needed</p>
                    <p>✓ Instant confirmation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

