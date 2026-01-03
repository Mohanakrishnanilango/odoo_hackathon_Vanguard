import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'

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
        expenses: {
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!trip) {
      return notFoundResponse()
    }

    // Check if user has access
    if (trip.userId !== user.id && trip.visibility === 'PRIVATE') {
      return unauthorizedResponse()
    }

    return NextResponse.json({ 
      expenses: trip.expenses
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
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

    if (!trip) {
      return notFoundResponse()
    }

    // Check if user has access
    if (trip.userId !== user.id && trip.visibility === 'PRIVATE') {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { name, amount, category, date, location } = body

    if (!name || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get coordinates for location (simplified - in production you'd use a geocoding API)
    let latitude = null
    let longitude = null
    if (location) {
      // This is a simplified approach - you'd want to use a proper geocoding service
      const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
        'tokyo': { lat: 35.6762, lng: 139.6503 },
        'kyoto': { lat: 35.0116, lng: 135.7681 },
        'osaka': { lat: 34.6937, lng: 135.5023 },
        'new york': { lat: 40.7128, lng: -74.0060 },
        'london': { lat: 51.5074, lng: -0.1278 },
        'paris': { lat: 48.8566, lng: 2.3522 },
      }

      const locationKey = location.toLowerCase()
      if (mockCoordinates[locationKey]) {
        latitude = mockCoordinates[locationKey].lat
        longitude = mockCoordinates[locationKey].lng
      }
    }

    const expense = await prisma.expense.create({
      data: {
        description: name, // Use description field instead of name
        amount: parseFloat(amount),
        category: category.toUpperCase(),
        date: new Date(date),
        tripId: params.id,
      },
    })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
