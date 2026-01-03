import { NextRequest, NextResponse } from 'next/server'

// Mock flight data
const mockFlights = [
  {
    id: 'FL001',
    airline: 'Emirates',
    airlineCode: 'EK',
    flightNumber: 'EK202',
    aircraft: 'Boeing 777-300ER',
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
    stops: 0,
    price: {
      economy: 850,
      business: 2500,
      first: 4500
    },
    availableSeats: {
      economy: 45,
      business: 12,
      first: 4
    },
    logoUrl: 'https://images.unsplash.com/photo-1436491865332-7a61da2091aa?w=100&h=100&fit=crop'
  },
  {
    id: 'FL002',
    airline: 'Qatar Airways',
    airlineCode: 'QR',
    flightNumber: 'QR543',
    aircraft: 'Airbus A350-900',
    departure: {
      airport: 'JFK',
      city: 'New York',
      time: '15:20',
      date: '2024-01-14',
      terminal: '4'
    },
    arrival: {
      airport: 'MAA',
      city: 'Chennai',
      time: '17:35',
      date: '2024-01-15',
      terminal: '2'
    },
    duration: '16h 15m',
    stops: 1,
    stopAirports: ['DOH'],
    price: {
      economy: 790,
      business: 2200,
      first: 3800
    },
    availableSeats: {
      economy: 38,
      business: 8,
      first: 2
    },
    logoUrl: 'https://images.unsplash.com/photo-1516436830601-3e1e7c7b7c8e?w=100&h=100&fit=crop'
  },
  {
    id: 'FL003',
    airline: 'Lufthansa',
    airlineCode: 'LH',
    flightNumber: 'LH400',
    aircraft: 'Airbus A340-600',
    departure: {
      airport: 'JFK',
      city: 'New York',
      time: '18:00',
      date: '2024-01-14',
      terminal: '1'
    },
    arrival: {
      airport: 'MAA',
      city: 'Chennai',
      time: '21:45',
      date: '2024-01-15',
      terminal: '2'
    },
    duration: '18h 45m',
    stops: 1,
    stopAirports: ['FRA'],
    price: {
      economy: 820,
      business: 2400,
      first: 4200
    },
    availableSeats: {
      economy: 52,
      business: 15,
      first: 6
    },
    logoUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop'
  },
  {
    id: 'FL004',
    airline: 'Singapore Airlines',
    airlineCode: 'SQ',
    flightNumber: 'SQ25',
    aircraft: 'Boeing 777-300ER',
    departure: {
      airport: 'JFK',
      city: 'New York',
      time: '22:30',
      date: '2024-01-14',
      terminal: '4'
    },
    arrival: {
      airport: 'MAA',
      city: 'Chennai',
      time: '04:45',
      date: '2024-01-16',
      terminal: '2'
    },
    duration: '20h 15m',
    stops: 1,
    stopAirports: ['SIN'],
    price: {
      economy: 910,
      business: 2800,
      first: 5200
    },
    availableSeats: {
      economy: 28,
      business: 6,
      first: 1
    },
    logoUrl: 'https://images.unsplash.com/photo-1522771733346-9cf6afcd04d6?w=100&h=100&fit=crop'
  },
  {
    id: 'FL005',
    airline: 'Air India',
    airlineCode: 'AI',
    flightNumber: 'AI144',
    aircraft: 'Boeing 787-9 Dreamliner',
    departure: {
      airport: 'EWR',
      city: 'Newark',
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
    },
    availableSeats: {
      economy: 65,
      business: 18,
      first: 8
    },
    logoUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bb8d3d4b?w=100&h=100&fit=crop'
  },
  {
    id: 'FL006',
    airline: 'British Airways',
    airlineCode: 'BA',
    flightNumber: 'BA117',
    aircraft: 'Boeing 777-200ER',
    departure: {
      airport: 'JFK',
      city: 'New York',
      time: '20:45',
      date: '2024-01-14',
      terminal: '7'
    },
    arrival: {
      airport: 'MAA',
      city: 'Chennai',
      time: '02:30',
      date: '2024-01-16',
      terminal: '2'
    },
    duration: '19h 45m',
    stops: 1,
    stopAirports: ['LHR'],
    price: {
      economy: 880,
      business: 2600,
      first: 4800
    },
    availableSeats: {
      economy: 41,
      business: 10,
      first: 3
    },
    logoUrl: 'https://images.unsplash.com/photo-1526779250093-2a8014e7d9e6?w=100&h=100&fit=crop'
  },
  {
    id: 'FL007',
    airline: 'SpiceJet',
    airlineCode: 'SG',
    flightNumber: 'SG524',
    aircraft: 'Boeing 737-800',
    departure: {
      airport: 'CJB',
      city: 'Coimbatore',
      time: '09:30',
      date: '2024-01-14',
      terminal: '1'
    },
    arrival: {
      airport: 'MAA',
      city: 'Chennai',
      time: '10:15',
      date: '2024-01-14',
      terminal: '1'
    },
    duration: '45m',
    stops: 0,
    price: {
      economy: 2500,
      business: 4500,
      first: 6500
    },
    availableSeats: {
      economy: 85,
      business: 12,
      first: 4
    },
    logoUrl: 'https://images.unsplash.com/photo-1478767543225-7a2a4c9f8c1b?w=100&h=100&fit=crop'
  },
  {
    id: 'FL008',
    airline: 'IndiGo',
    airlineCode: '6E',
    flightNumber: '6E7123',
    aircraft: 'Airbus A320neo',
    departure: {
      airport: 'CJB',
      city: 'Coimbatore',
      time: '14:45',
      date: '2024-01-14',
      terminal: '2'
    },
    arrival: {
      airport: 'MAA',
      city: 'Chennai',
      time: '15:30',
      date: '2024-01-14',
      terminal: '1'
    },
    duration: '45m',
    stops: 0,
    price: {
      economy: 2200,
      business: 4000,
      first: 6000
    },
    availableSeats: {
      economy: 92,
      business: 15,
      first: 6
    },
    logoUrl: 'https://images.unsplash.com/photo-1522771733346-9cf6afcd04d6?w=100&h=100&fit=crop'
  },
  {
    id: 'FL009',
    airline: 'AirAsia India',
    airlineCode: 'I5',
    flightNumber: 'I5621',
    aircraft: 'Airbus A320',
    departure: {
      airport: 'CJB',
      city: 'Coimbatore',
      time: '18:30',
      date: '2024-01-14',
      terminal: '1'
    },
    arrival: {
      airport: 'MAA',
      city: 'Chennai',
      time: '19:15',
      date: '2024-01-14',
      terminal: '1'
    },
    duration: '45m',
    stops: 0,
    price: {
      economy: 1800,
      business: 3500,
      first: 5500
    },
    availableSeats: {
      economy: 78,
      business: 8,
      first: 2
    },
    logoUrl: 'https://images.unsplash.com/photo-1522771733346-9cf6afcd04d6?w=100&h=100&fit=crop'
  },
  {
    id: 'FL010',
    airline: 'Vistara',
    airlineCode: 'UK',
    flightNumber: 'UK831',
    aircraft: 'Airbus A321neo',
    departure: {
      airport: 'CJB',
      city: 'Coimbatore',
      time: '07:00',
      date: '2024-01-15',
      terminal: '1'
    },
    arrival: {
      airport: 'MAA',
      city: 'Chennai',
      time: '07:45',
      date: '2024-01-15',
      terminal: '1'
    },
    duration: '45m',
    stops: 0,
    price: {
      economy: 2800,
      business: 5200,
      first: 8000
    },
    availableSeats: {
      economy: 65,
      business: 10,
      first: 3
    },
    logoUrl: 'https://images.unsplash.com/photo-1522771733346-9cf6afcd04d6?w=100&h=100&fit=crop'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const departureDate = searchParams.get('departureDate')
    const returnDate = searchParams.get('returnDate')
    const tripType = searchParams.get('tripType')
    const adults = parseInt(searchParams.get('adults') || '1')
    const children = parseInt(searchParams.get('children') || '0')
    const infants = parseInt(searchParams.get('infants') || '0')
    const classType = searchParams.get('classType') || 'economy'
    const directFlightsOnly = searchParams.get('directFlightsOnly') === 'true'

    // Filter flights based on search criteria
    let filteredFlights = [...mockFlights]

    // Filter by route (simplified - in real app would use airport codes)
    if (from && to) {
      filteredFlights = filteredFlights.filter(flight => {
        const fromMatch = flight.departure.city.toLowerCase().includes(from.toLowerCase()) ||
                         flight.departure.airport.toLowerCase().includes(from.toLowerCase()) ||
                         from.toLowerCase().includes(flight.departure.city.toLowerCase()) ||
                         from.toLowerCase().includes(flight.departure.airport.toLowerCase())
        const toMatch = flight.arrival.city.toLowerCase().includes(to.toLowerCase()) ||
                       flight.arrival.airport.toLowerCase().includes(to.toLowerCase()) ||
                       to.toLowerCase().includes(flight.arrival.city.toLowerCase()) ||
                       to.toLowerCase().includes(flight.arrival.airport.toLowerCase())
        return fromMatch && toMatch
      })
    } else if (from) {
      // If only from is specified, show all flights from that location
      filteredFlights = filteredFlights.filter(flight => {
        return flight.departure.city.toLowerCase().includes(from.toLowerCase()) ||
               flight.departure.airport.toLowerCase().includes(from.toLowerCase()) ||
               from.toLowerCase().includes(flight.departure.city.toLowerCase()) ||
               from.toLowerCase().includes(flight.departure.airport.toLowerCase())
      })
    } else if (to) {
      // If only to is specified, show all flights to that location
      filteredFlights = filteredFlights.filter(flight => {
        return flight.arrival.city.toLowerCase().includes(to.toLowerCase()) ||
               flight.arrival.airport.toLowerCase().includes(to.toLowerCase()) ||
               to.toLowerCase().includes(flight.arrival.city.toLowerCase()) ||
               to.toLowerCase().includes(flight.arrival.airport.toLowerCase())
      })
    }

    // Filter by direct flights only
    if (directFlightsOnly) {
      filteredFlights = filteredFlights.filter(flight => flight.stops === 0)
    }

    // Check availability for requested class and passenger count
    filteredFlights = filteredFlights.filter(flight => {
      const totalPassengers = adults + children + infants
      return flight.availableSeats[classType as keyof typeof flight.availableSeats] >= totalPassengers
    })

    // Sort by price (lowest first)
    filteredFlights.sort((a, b) => a.price[classType as keyof typeof a.price] - b.price[classType as keyof typeof b.price])

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      flights: filteredFlights,
      searchCriteria: {
        from,
        to,
        departureDate,
        returnDate,
        tripType,
        travelers: { adults, children, infants },
        classType,
        directFlightsOnly
      },
      totalResults: filteredFlights.length
    })

  } catch (error) {
    console.error('Error searching flights:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search flights' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flightId, tripType, classType, travelers, passengerDetails, additionalServices, paymentMethod } = body

    // Validate required fields
    if (!flightId || !classType || !travelers || !passengerDetails || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the flight
    const flight = mockFlights.find(f => f.id === flightId)
    if (!flight) {
      return NextResponse.json(
        { success: false, error: 'Flight not found' },
        { status: 404 }
      )
    }

    // Check availability
    const totalPassengers = travelers.adults + travelers.children + travelers.infants
    const availableSeats = flight.availableSeats[classType as keyof typeof flight.availableSeats]
    
    if (availableSeats < totalPassengers) {
      return NextResponse.json(
        { success: false, error: 'Not enough seats available' },
        { status: 400 }
      )
    }

    // Calculate total price
    let totalPrice = flight.price[classType as keyof typeof flight.price] * (travelers.adults + travelers.children)
    
    // Add additional services costs
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
      tripType,
      flight: {
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        departure: flight.departure,
        arrival: flight.arrival,
        duration: flight.duration,
        stops: flight.stops
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

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      booking,
      message: 'Flight booked successfully!'
    })

  } catch (error) {
    console.error('Error booking flight:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to book flight' },
      { status: 500 }
    )
  }
}
