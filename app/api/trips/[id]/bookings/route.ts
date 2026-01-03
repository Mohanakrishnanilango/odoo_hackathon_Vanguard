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
          orderBy: { date: 'asc' },
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

    // Transform expenses into booking data
    const bookings = trip.expenses.map(expense => ({
      date: expense.date.toISOString().split('T')[0],
      amount: expense.amount,
      type: expense.category.toLowerCase() as 'hotel' | 'flight' | 'activity',
    }))

    return NextResponse.json({ 
      bookings,
      budget: trip.budget || 0,
      spent: trip.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    })
  } catch (error) {
    console.error('Error fetching booking data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
