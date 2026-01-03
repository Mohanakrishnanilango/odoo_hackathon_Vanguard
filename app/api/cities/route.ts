import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-helpers'

// Mock cities data for demonstration
const mockCities = [
  { id: '1', name: 'Tokyo', country: 'Japan', countryCode: 'JP', popularity: 95, costIndex: 85, description: 'Vibrant metropolis blending tradition and innovation', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop' },
  { id: '2', name: 'Paris', country: 'France', countryCode: 'FR', popularity: 92, costIndex: 78, description: 'City of lights, art, and romance', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop' },
  { id: '3', name: 'New York', country: 'United States', countryCode: 'US', popularity: 91, costIndex: 88, description: 'The city that never sleeps', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop' },
  { id: '4', name: 'London', country: 'United Kingdom', countryCode: 'GB', popularity: 89, costIndex: 82, description: 'Historic capital with modern charm', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop' },
  { id: '5', name: 'Barcelona', country: 'Spain', countryCode: 'ES', popularity: 87, costIndex: 65, description: 'Coastal city with Gaudí architecture', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop' },
  { id: '6', name: 'Rome', country: 'Italy', countryCode: 'IT', popularity: 88, costIndex: 70, description: 'Eternal city of history and culture', imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800&h=600&fit=crop' },
  { id: '7', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', popularity: 86, costIndex: 75, description: 'Modern oasis in the desert', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop' },
  { id: '8', name: 'Singapore', country: 'Singapore', countryCode: 'SG', popularity: 84, costIndex: 80, description: 'Garden city with futuristic skyline', imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop' },
  { id: '9', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', popularity: 82, costIndex: 72, description: 'Canal city with artistic heritage', imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop' },
  { id: '10', name: 'Bali', country: 'Indonesia', countryCode: 'ID', popularity: 90, costIndex: 45, description: 'Tropical paradise with spiritual vibes', imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop' },
  { id: '11', name: 'Sydney', country: 'Australia', countryCode: 'AU', popularity: 83, costIndex: 85, description: 'Harbor city with iconic opera house', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' },
  { id: '12', name: 'Mumbai', country: 'India', countryCode: 'IN', popularity: 88, costIndex: 35, description: 'Bollywood capital and financial hub', imageUrl: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&h=600&fit=crop' },
  { id: '13', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', popularity: 85, costIndex: 40, description: 'Street food paradise and golden temples', imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop' },
  { id: '14', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', popularity: 81, costIndex: 55, description: 'Where East meets West', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7203?w=800&h=600&fit=crop' },
  { id: '15', name: 'Cairo', country: 'Egypt', countryCode: 'EG', popularity: 79, costIndex: 30, description: 'Ancient pyramids and bustling markets', imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800&h=600&fit=crop' },
  { id: '16', name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', popularity: 83, costIndex: 50, description: 'Carnival city with stunning beaches', imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop' },
  { id: '17', name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', popularity: 78, costIndex: 42, description: 'Coastal city with Table Mountain', imageUrl: 'https://images.unsplash.com/photo-1579532585413-8e5d4a7e6b4e?w=800&h=600&fit=crop' },
  { id: '18', name: 'Berlin', country: 'Germany', countryCode: 'DE', popularity: 80, costIndex: 68, description: 'Creative capital with rich history', imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3ac3cd?w=800&h=600&fit=crop' },
  { id: '19', name: 'Toronto', country: 'Canada', countryCode: 'CA', popularity: 82, costIndex: 76, description: 'Multicultural city by the lake', imageUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=600&fit=crop' },
  { id: '20', name: 'Seoul', country: 'South Korea', countryCode: 'KR', popularity: 86, costIndex: 62, description: 'K-pop capital and tech hub', imageUrl: 'https://images.unsplash.com/photo-1578645510449-e8b1c896bb56?w=800&h=600&fit=crop' },
  { id: '21', name: 'Mexico City', country: 'Mexico', countryCode: 'MX', popularity: 77, costIndex: 38, description: 'Ancient Aztec history meets modern life', imageUrl: 'https://images.unsplash.com/photo-1514890547357-2717063c2225?w=800&h=600&fit=crop' },
  { id: '22', name: 'Lisbon', country: 'Portugal', countryCode: 'PT', popularity: 80, costIndex: 58, description: 'Coastal capital with fado music', imageUrl: 'https://images.unsplash.com/photo-1555881403-671f5857c63b?w=800&h=600&fit=crop' },
  { id: '23', name: 'Athens', country: 'Greece', countryCode: 'GR', popularity: 79, costIndex: 52, description: 'Cradle of Western civilization', imageUrl: 'https://images.unsplash.com/photo-1603574670812-df7088f3a880?w=800&h=600&fit=crop' },
  { id: '24', name: 'Prague', country: 'Czech Republic', countryCode: 'CZ', popularity: 81, costIndex: 48, description: 'Fairytale city with medieval charm', imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop' },
  { id: '25', name: 'Vienna', country: 'Austria', countryCode: 'AT', popularity: 78, costIndex: 64, description: 'City of music and imperial palaces', imageUrl: 'https://images.unsplash.com/photo-1549144511-f099e777c147?w=800&h=600&fit=crop' },
  { id: '26', name: 'Zurich', country: 'Switzerland', countryCode: 'CH', popularity: 75, costIndex: 90, description: 'Banking hub with Alpine views', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop' },
  { id: '27', name: 'Stockholm', country: 'Sweden', countryCode: 'SE', popularity: 76, costIndex: 82, description: 'Scandinavian capital on water', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' },
  { id: '28', name: 'Oslo', country: 'Norway', countryCode: 'NO', popularity: 73, costIndex: 86, description: 'Gateway to Norwegian fjords', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop' },
  { id: '29', name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', popularity: 77, costIndex: 78, description: 'Danish capital of design and hygge', imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop' },
  { id: '30', name: 'Reykjavik', country: 'Iceland', countryCode: 'IS', popularity: 71, costIndex: 92, description: 'Nordic capital of fire and ice', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const country = searchParams.get('country')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Use mock data for now, but apply filters
    let filteredCities = [...mockCities]

    // Apply search filter
    if (search) {
      filteredCities = filteredCities.filter(city => 
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.country.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply country filter
    if (country) {
      filteredCities = filteredCities.filter(city => 
        city.country.toLowerCase().includes(country.toLowerCase())
      )
    }

    // Apply pagination
    const startIndex = offset
    const endIndex = startIndex + limit
    const paginatedCities = filteredCities.slice(startIndex, endIndex)

    return NextResponse.json({
      cities: paginatedCities,
      total: filteredCities.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
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

    const body = await request.json()
    const { name, address, latitude, longitude, placeId, country, countryCode } = body

    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: name, latitude, longitude' },
        { status: 400 }
      )
    }

    // Extract country from address if not provided
    let finalCountry = country || 'Unknown'
    let finalCountryCode = countryCode || 'XX'
    
    if (address && !country) {
      // Try to extract country from address (simplified)
      const addressParts = address.split(',').map(s => s.trim())
      if (addressParts.length > 0) {
        finalCountry = addressParts[addressParts.length - 1]
      }
    }

    // Check if city already exists
    const existingCity = await prisma.city.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        country: { equals: finalCountry, mode: 'insensitive' },
      },
    })

    if (existingCity) {
      return NextResponse.json({ city: existingCity })
    }

    // Create new city
    const city = await prisma.city.create({
      data: {
        name,
        country: finalCountry,
        countryCode: finalCountryCode,
        latitude,
        longitude,
        description: address || `A beautiful destination in ${finalCountry}`,
        popularity: 50, // Default popularity
        costIndex: 50, // Default cost index
        imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(name + ' ' + finalCountry)}`,
      },
    })

    return NextResponse.json({ city }, { status: 201 })
  } catch (error) {
    console.error('Error creating city:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

