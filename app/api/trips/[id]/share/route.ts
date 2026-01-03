import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'
import { randomBytes } from 'crypto'

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

    if (trip.userId !== user.id) {
      return unauthorizedResponse()
    }

    // Generate share token
    const token = randomBytes(32).toString('hex')

    // Update trip with share token
    const updatedTrip = await prisma.trip.update({
      where: { id: params.id },
      data: {
        shareToken: token,
        visibility: 'SHARED',
      },
    })

    // Create shared itinerary record
    const sharedItinerary = await prisma.sharedItinerary.create({
      data: {
        tripId: params.id,
        sharedBy: user.id,
        token,
      },
    })

    return NextResponse.json({
      shareToken: token,
      shareUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${token}`,
    })
  } catch (error) {
    console.error('Error sharing trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

