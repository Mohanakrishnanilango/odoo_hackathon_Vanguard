import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-helpers'

// Mock car data - in production, this would come from a database
const mockCars = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2024,
    type: 'economy',
    pricePerDay: 45,
    seats: 5,
    transmission: 'automatic',
    fuel: 'gasoline',
    imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=250&fit=crop',
    features: ['Air Conditioning', 'Bluetooth', 'USB', 'Cruise Control'],
    rating: 4.5,
    available: true
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2024,
    type: 'compact',
    pricePerDay: 55,
    seats: 5,
    transmission: 'automatic',
    fuel: 'gasoline',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop',
    features: ['Air Conditioning', 'Bluetooth', 'USB', 'Parking Sensors'],
    rating: 4.6,
    available: true
  },
  {
    id: '3',
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    type: 'midsize',
    pricePerDay: 95,
    seats: 5,
    transmission: 'automatic',
    fuel: 'electric',
    imageUrl: 'https://images.unsplash.com/photo-1617657410875-3ec0c5a32b27?w=400&h=250&fit=crop',
    features: ['Autopilot', 'GPS', 'Bluetooth', 'Climate Control', 'Premium Audio'],
    rating: 4.8,
    available: true
  },
  {
    id: '4',
    make: 'Ford',
    model: 'Explorer',
    year: 2024,
    type: 'suv',
    pricePerDay: 85,
    seats: 7,
    transmission: 'automatic',
    fuel: 'gasoline',
    imageUrl: 'https://images.unsplash.com/photo-1593504019319-0601a5a6a8b5?w=400&h=250&fit=crop',
    features: ['Air Conditioning', 'Bluetooth', 'USB', 'Backup Camera', '3rd Row Seating'],
    rating: 4.4,
    available: true
  },
  {
    id: '5',
    make: 'BMW',
    model: '5 Series',
    year: 2024,
    type: 'luxury',
    pricePerDay: 150,
    seats: 5,
    transmission: 'automatic',
    fuel: 'gasoline',
    imageUrl: 'https://images.unsplash.com/photo-1555357540-9f5d4fcd3a4c?w=400&h=250&fit=crop',
    features: ['Leather Seats', 'GPS', 'Bluetooth', 'Climate Control', 'Sunroof', 'Premium Audio'],
    rating: 4.9,
    available: true
  },
  {
    id: '6',
    make: 'Nissan',
    model: 'Leaf',
    year: 2024,
    type: 'compact',
    pricePerDay: 65,
    seats: 5,
    transmission: 'automatic',
    fuel: 'electric',
    imageUrl: 'https://images.unsplash.com/photo-1617657410875-3ec0c5a32b27?w=400&h=250&fit=crop',
    features: ['GPS', 'Bluetooth', 'USB', 'Climate Control', 'Eco Mode'],
    rating: 4.3,
    available: false
  },
  {
    id: '7',
    make: 'Chevrolet',
    model: 'Malibu',
    year: 2024,
    type: 'midsize',
    pricePerDay: 65,
    seats: 5,
    transmission: 'automatic',
    fuel: 'gasoline',
    imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=250&fit=crop',
    features: ['Air Conditioning', 'Bluetooth', 'USB', 'Cruise Control'],
    rating: 4.2,
    available: true
  },
  {
    id: '8',
    make: 'Jeep',
    model: 'Wrangler',
    year: 2024,
    type: 'suv',
    pricePerDay: 95,
    seats: 4,
    transmission: 'manual',
    fuel: 'gasoline',
    imageUrl: 'https://images.unsplash.com/photo-1593504019319-0601a5a6a8b5?w=400&h=250&fit=crop',
    features: ['4WD', 'Air Conditioning', 'Bluetooth', 'Removable Top'],
    rating: 4.6,
    available: true
  }
]

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const location = searchParams.get('location') || ''
    const pickupDate = searchParams.get('pickupDate') || ''
    const returnDate = searchParams.get('returnDate') || ''
    const carType = searchParams.get('carType')?.split(',').filter(Boolean) || []
    const transmission = searchParams.get('transmission')?.split(',').filter(Boolean) || []
    const fuel = searchParams.get('fuel')?.split(',').filter(Boolean) || []
    const minPrice = parseInt(searchParams.get('minPrice') || '0')
    const maxPrice = parseInt(searchParams.get('maxPrice') || '500')
    const features = searchParams.get('features')?.split(',').filter(Boolean) || []

    // Filter cars based on criteria
    let filteredCars = mockCars.filter(car => {
      // Price range
      if (car.pricePerDay < minPrice || car.pricePerDay > maxPrice) return false
      
      // Car type
      if (carType.length > 0 && !carType.includes(car.type)) return false
      
      // Transmission
      if (transmission.length > 0 && !transmission.includes(car.transmission)) return false
      
      // Fuel type
      if (fuel.length > 0 && !fuel.includes(car.fuel)) return false
      
      // Features
      if (features.length > 0) {
        const hasAllFeatures = features.every(feature => 
          car.features.some(carFeature => 
            carFeature.toLowerCase().includes(feature.toLowerCase())
          )
        )
        if (!hasAllFeatures) return false
      }
      
      return true
    })

    // Sort by price and rating
    filteredCars.sort((a, b) => {
      // Prioritize available cars
      if (a.available && !b.available) return -1
      if (!a.available && b.available) return 1
      
      // Then by rating
      if (b.rating !== a.rating) return b.rating - a.rating
      
      // Finally by price
      return a.pricePerDay - b.pricePerDay
    })

    return NextResponse.json({
      cars: filteredCars,
      filters: {
        location,
        pickupDate,
        returnDate,
        carType,
        transmission,
        fuel,
        priceRange: [minPrice, maxPrice],
        features
      },
      total: filteredCars.length
    })
  } catch (error) {
    console.error('Error fetching car rentals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
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

    // Find the car
    const car = mockCars.find(c => c.id === bookingData.carId)
    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    if (!car.available) {
      return NextResponse.json(
        { error: 'Car is not available' },
        { status: 400 }
      )
    }

    // Calculate rental days
    const pickupDate = new Date(bookingData.pickupDate)
    const returnDate = new Date(bookingData.returnDate)
    const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (days <= 0) {
      return NextResponse.json(
        { error: 'Return date must be after pickup date' },
        { status: 400 }
      )
    }

    // Generate booking reference
    const bookingReference = `CR${Date.now().toString().slice(-6)}`

    // Create booking (in production, this would be saved to database)
    const booking = {
      id: `booking_${Date.now()}`,
      carId: bookingData.carId,
      car: {
        make: car.make,
        model: car.model,
        year: car.year,
        type: car.type,
        imageUrl: car.imageUrl
      },
      pickupLocation: bookingData.pickupLocation,
      pickupDate: bookingData.pickupDate,
      pickupTime: bookingData.pickupTime || '10:00',
      returnDate: bookingData.returnDate,
      returnTime: bookingData.returnTime || '10:00',
      totalPrice: bookingData.totalPrice || (car.pricePerDay * days),
      status: 'upcoming',
      bookingReference,
      insurance: bookingData.insurance || 'basic',
      additionalServices: bookingData.additionalServices || [],
      userId: user.id,
      createdAt: new Date().toISOString()
    }

    // In production, you would save this to your database
    console.log('Car rental booking created:', booking)

    return NextResponse.json({
      success: true,
      booking,
      message: 'Car rental booked successfully'
    })
  } catch (error) {
    console.error('Error creating car rental booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
