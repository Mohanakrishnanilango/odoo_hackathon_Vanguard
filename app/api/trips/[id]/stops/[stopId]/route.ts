import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const updateStopSchema = z.object({
  arrivalDate: z.string().datetime().optional(),
  departureDate: z.string().datetime().optional(),
  order: z.number().int().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; stopId: string } }
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

    const stop = await prisma.tripStop.findUnique({
      where: { id: params.stopId },
    })

    if (!stop || stop.tripId !== params.id) {
      return notFoundResponse('Stop not found')
    }

    const body = await request.json()
    const data = updateStopSchema.parse(body)

    const updateData: any = {}
    if (data.arrivalDate) updateData.arrivalDate = new Date(data.arrivalDate)
    if (data.departureDate) updateData.departureDate = new Date(data.departureDate)
    if (data.order !== undefined) updateData.order = data.order

    const updatedStop = await prisma.tripStop.update({
      where: { id: params.stopId },
      data: updateData,
      include: {
        city: true,
        activities: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ stop: updatedStop })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating stop:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; stopId: string } }
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

    const stop = await prisma.tripStop.findUnique({
      where: { id: params.stopId },
    })

    if (!stop || stop.tripId !== params.id) {
      return notFoundResponse('Stop not found')
    }

    await prisma.tripStop.delete({
      where: { id: params.stopId },
    })

    return NextResponse.json({ message: 'Stop deleted successfully' })
  } catch (error) {
    console.error('Error deleting stop:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

