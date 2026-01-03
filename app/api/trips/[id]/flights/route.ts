import { NextRequest, NextResponse } from 'next/server'

// Mock flight bookings for trips
const mockTripFlights: Record<string, any[]> = {
  'trip-1': [
    {
      id: 'BK001',
      bookingReference: 'FLABC123',
      flight: {
        airline: 'Emirates',
        flightNumber: 'EK202',
        departure: {
          airport: 'JFK',
          city: 'New York',
          time: '10:45',
          date: '2024-01-14',
          terminal: '4'
        },
        arrival: {
          airport: 'MAA',
          city: 'Chennai',
          time: '13:15',
          date: '2024-01-15',
          terminal: '2'
        },
        duration: '14h 30m',
        stops: 0
      },
      passengers: [
        { name: 'Raja Rajan M', type: 'adult' }
      ],
      classType: 'economy',
      totalPrice: 850,
      status: 'upcoming',
      paymentStatus: 'paid',
      bookingDate: '2024-01-01T10:00:00Z',
      additionalServices: {
        travelInsurance: true,
        extraBaggage: false,
        seatSelection: true,
        mealPreference: 'vegetarian'
      }
    }
  ],
  'trip-2': [
    {
      id: 'BK002',
      bookingReference: 'FLXYZ789',
      flight: {
        airline: 'Qatar Airways',
        flightNumber: 'QR543',
        departure: {
          airport: 'LHR',
          city: 'London',
          time: '08:30',
          date: '2024-02-10',
          terminal: '5'
        },
        arrival: {
          airport: 'BOM',
          city: 'Mumbai',
          time: '22:45',
          date: '2024-02-10',
          terminal: '2'
        },
        duration: '9h 15m',
        stops: 0
      },
      passengers: [
        { name: 'Raja Rajan M', type: 'adult' },
        { name: 'Guest User', type: 'adult' }
      ],
      classType: 'business',
      totalPrice: 4400,
      status: 'upcoming',
      paymentStatus: 'paid',
      bookingDate: '2024-01-05T14:30:00Z',
      additionalServices: {
        travelInsurance: true,
        extraBaggage: true,
        seatSelection: true,
        mealPreference: 'nonVegetarian'
      }
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required' },
        { status: 400 }
      )
    }

    // Get flights for the specific trip
    const flights = mockTripFlights[tripId] || []

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json({
      success: true,
      flights,
      tripId,
      totalFlights: flights.length
    })

  } catch (error) {
    console.error('Error fetching trip flights:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trip flights' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id
    const body = await request.json()
    const { flightId, classType, travelers, passengerDetails, additionalServices, paymentMethod } = body

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!flightId || !classType || !travelers || !passengerDetails || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mock flight data (in real app, would fetch from flights API)
    const mockFlight = {
      id: flightId,
      airline: 'Air India',
      flightNumber: 'AI144',
      departure: {
        airport: 'JFK',
        city: 'New York',
        time: '08:15',
        date: '2024-01-14',
        terminal: 'C'
      },
      arrival: {
        airport: 'MAA',
        city: 'Chennai',
        time: '11:30',
        date: '2024-01-15',
        terminal: '2'
      },
      duration: '16h 15m',
      stops: 0,
      price: {
        economy: 750,
        business: 2000,
        first: 3500
      }
    }

    // Calculate total price
    let totalPrice = mockFlight.price[classType as keyof typeof mockFlight.price] * (travelers.adults + travelers.children)
    
    // Add additional services costs
    const totalPassengers = travelers.adults + travelers.children + travelers.infants
    if (additionalServices.travelInsurance) {
      totalPrice += totalPassengers * 50
    }
    if (additionalServices.extraBaggage) {
      totalPrice += totalPassengers * 30
    }
    if (additionalServices.seatSelection) {
      totalPrice += totalPassengers * 15
    }

    // Generate booking reference
    const bookingReference = 'FL' + Math.random().toString(36).substr(2, 9).toUpperCase()

    // Create booking
    const booking = {
      id: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      bookingReference,
      flightId,
      tripId,
      flight: {
        airline: mockFlight.airline,
        flightNumber: mockFlight.flightNumber,
        departure: mockFlight.departure,
        arrival: mockFlight.arrival,
        duration: mockFlight.duration,
        stops: mockFlight.stops
      },
      passengers: passengerDetails.map((p: any, index: number) => ({
        name: `${p.firstName} ${p.lastName}`,
        type: index < travelers.adults ? 'adult' : index < travelers.adults + travelers.children ? 'child' : 'infant'
      })),
      classType,
      totalPrice,
      status: 'upcoming',
      paymentStatus: 'paid',
      bookingDate: new Date().toISOString(),
      additionalServices,
      paymentMethod
    }

    // Add to mock trip flights
    if (!mockTripFlights[tripId]) {
      mockTripFlights[tripId] = []
    }
    mockTripFlights[tripId].push(booking)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      booking,
      message: 'Flight booked successfully for your trip!'
    })

  } catch (error) {
    console.error('Error booking trip flight:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to book flight for trip' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!tripId || !bookingId) {
      return NextResponse.json(
        { success: false, error: 'Trip ID and booking ID are required' },
        { status: 400 }
      )
    }

    // Find and remove the booking
    const tripBookings = mockTripFlights[tripId] || []
    const bookingIndex = tripBookings.findIndex((b: any) => b.id === bookingId)
    
    if (bookingIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update status to cancelled instead of removing
    tripBookings[bookingIndex].status = 'cancelled'
    tripBookings[bookingIndex].paymentStatus = 'refunded'

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: 'Flight booking cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling trip flight:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel flight booking' },
      { status: 500 }
    )
  }
}
