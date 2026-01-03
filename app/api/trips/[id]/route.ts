import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const updateTripSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  coverPhoto: z.string().url().optional(),
  budget: z.number().min(0).optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'SHARED']).optional(),
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
        expenses: {
          orderBy: { date: 'desc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await request.json()
    const data = updateTripSchema.parse(body)

    const updateData: any = { ...data }
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate)
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate)
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: params.id },
      data: updateData,
      include: {
        stops: {
          include: {
            city: true,
          },
        },
      },
    })

    return NextResponse.json({ trip: updatedTrip })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.trip.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Trip deleted successfully' })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

