import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'

// Mock car rental bookings for demonstration
// In production, this would be stored in the database
const mockBookings = [
  {
    id: 'booking_1',
    carId: '1',
    car: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      type: 'economy',
      imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=250&fit=crop'
    },
    pickupLocation: 'Tokyo Airport',
    pickupDate: '2024-03-15',
    pickupTime: '10:00',
    returnDate: '2024-03-18',
    returnTime: '10:00',
    totalPrice: 135,
    status: 'upcoming',
    bookingReference: 'CR123456',
    insurance: 'basic',
    additionalServices: ['GPS'],
    tripId: 'trip_1',
    userId: 'user_1',
    createdAt: '2024-02-15T10:00:00Z'
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        stops: true,
      },
    })

    if (!trip || trip.userId !== user.id) {
      return notFoundResponse()
    }

    // Filter bookings for this trip
    const tripBookings = mockBookings.filter(booking => booking.tripId === params.id)

    // Update status based on dates
    const updatedBookings = tripBookings.map(booking => {
      const today = new Date()
      const pickupDate = new Date(booking.pickupDate)
      const returnDate = new Date(booking.returnDate)
      
      let status = booking.status
      if (today >= pickupDate && today <= returnDate) {
        status = 'active'
      } else if (today > returnDate) {
        status = 'completed'
      }
      
      return { ...booking, status }
    })

    return NextResponse.json({
      rentals: updatedBookings,
      trip: {
        id: trip.id,
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate
      }
    })
  } catch (error) {
    console.error('Error fetching trip car rentals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
    })

    if (!trip || trip.userId !== user.id) {
      return notFoundResponse()
    }

    const bookingData = await request.json()
    
    // Validate required fields
    const requiredFields = ['carId', 'pickupLocation', 'pickupDate', 'returnDate']
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate dates are within trip duration
    const tripStartDate = new Date(trip.startDate)
    const tripEndDate = new Date(trip.endDate)
    const pickupDate = new Date(bookingData.pickupDate)
    const returnDate = new Date(bookingData.returnDate)

    if (pickupDate < tripStartDate || returnDate > tripEndDate) {
      return NextResponse.json(
        { error: 'Rental dates must be within trip duration' },
        { status: 400 }
      )
    }

    // Generate booking reference
    const bookingReference = `CR${Date.now().toString().slice(-6)}`

    // Create booking (in production, this would be saved to database)
    const booking = {
      id: `booking_${Date.now()}`,
      carId: bookingData.carId,
      car: bookingData.car || {
        make: 'Unknown',
        model: 'Car',
        year: 2024,
        type: 'economy',
        imageUrl: null
      },
      pickupLocation: bookingData.pickupLocation,
      pickupDate: bookingData.pickupDate,
      pickupTime: bookingData.pickupTime || '10:00',
      returnDate: bookingData.returnDate,
      returnTime: bookingData.returnTime || '10:00',
      totalPrice: bookingData.totalPrice,
      status: 'upcoming',
      bookingReference,
      insurance: bookingData.insurance || 'basic',
      additionalServices: bookingData.additionalServices || [],
      tripId: params.id,
      userId: user.id,
      createdAt: new Date().toISOString()
    }

    // In production, you would save this to your database
    mockBookings.push(booking)
    console.log('Trip car rental booking created:', booking)

    return NextResponse.json({
      success: true,
      booking,
      message: 'Car rental added to trip successfully'
    })
  } catch (error) {
    console.error('Error creating trip car rental booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
