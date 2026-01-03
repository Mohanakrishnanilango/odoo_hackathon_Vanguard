import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notFoundResponse } from '@/lib/api-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { shareToken: params.token },
      include: {
        stops: {
          include: {
            city: true,
            activities: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!trip || trip.visibility !== 'SHARED') {
      return notFoundResponse('Shared itinerary not found')
    }

    // Update view count
    await prisma.sharedItinerary.updateMany({
      where: { token: params.token },
      data: {
        viewCount: { increment: 1 },
      },
    })

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error fetching shared trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

