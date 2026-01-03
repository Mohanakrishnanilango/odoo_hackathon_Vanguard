import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const createStopSchema = z.object({
  cityId: z.string(),
  arrivalDate: z.string().datetime(),
  departureDate: z.string().datetime(),
  order: z.number().int().optional(),
})

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
    })

    if (!trip || trip.userId !== user.id) {
      return unauthorizedResponse()
    }

    const stops = await prisma.tripStop.findMany({
      where: { tripId: params.id },
      include: {
        city: true,
        activities: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ stops })
  } catch (error) {
    console.error('Error fetching stops:', error)
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
      return notFoundResponse('Trip not found')
    }

    if (trip.userId !== user.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const data = createStopSchema.parse(body)

    // Get current max order
    const maxOrder = await prisma.tripStop.findFirst({
      where: { tripId: params.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const stop = await prisma.tripStop.create({
      data: {
        tripId: params.id,
        cityId: data.cityId,
        arrivalDate: new Date(data.arrivalDate),
        departureDate: new Date(data.departureDate),
        order: data.order ?? (maxOrder ? maxOrder.order + 1 : 0),
      },
      include: {
        city: true,
        activities: true,
      },
    })

    return NextResponse.json({ stop }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating stop:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

