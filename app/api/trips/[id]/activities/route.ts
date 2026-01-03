import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const addActivitySchema = z.object({
  activityId: z.string(),
  stopId: z.string(),
  startTime: z.string().datetime().optional(),
  order: z.number().int().optional(),
})

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

    if (!trip || trip.userId !== user.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const data = addActivitySchema.parse(body)

    // Verify stop belongs to trip
    const stop = await prisma.tripStop.findUnique({
      where: { id: data.stopId },
    })

    if (!stop || stop.tripId !== params.id) {
      return notFoundResponse('Stop not found')
    }

    // Get current max order for activities in this stop
    const maxOrder = await prisma.activity.findFirst({
      where: { stopId: data.stopId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const activity = await prisma.activity.update({
      where: { id: data.activityId },
      data: {
        stopId: data.stopId,
        order: data.order ?? (maxOrder ? maxOrder.order + 1 : 0),
        startTime: data.startTime ? new Date(data.startTime) : null,
      },
      include: {
        city: true,
      },
    })

    return NextResponse.json({ activity }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error adding activity:', error)
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

    if (!trip || trip.userId !== user.id) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get('activityId')

    if (!activityId) {
      return NextResponse.json(
        { error: 'activityId is required' },
        { status: 400 }
      )
    }

    // Verify activity belongs to a stop in this trip
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        stop: true,
      },
    })

    if (!activity || !activity.stop || activity.stop.tripId !== params.id) {
      return notFoundResponse('Activity not found in this trip')
    }

    await prisma.activity.update({
      where: { id: activityId },
      data: {
        stopId: null,
        startTime: null,
        endTime: null,
        order: 0,
      },
    })

    return NextResponse.json({ message: 'Activity removed successfully' })
  } catch (error) {
    console.error('Error removing activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

