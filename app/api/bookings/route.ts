import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    // Get all trips for the user
    const trips = await prisma.trip.findMany({
      where: { userId: user.id },
      include: {
        expenses: {
          orderBy: { date: 'asc' },
        },
      },
    })

    // Collect all expenses from all trips
    const allBookings = trips.flatMap(trip => 
      trip.expenses.map(expense => ({
        date: expense.date.toISOString().split('T')[0],
        amount: expense.amount,
        type: expense.category.toLowerCase() as 'hotel' | 'flight' | 'activity',
      }))
    )

    // Sort by date
    allBookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate total budget and spent
    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0)
    const totalSpent = trips.reduce((sum, trip) => 
      sum + trip.expenses.reduce((tripSum, expense) => tripSum + expense.amount, 0), 0
    )

    return NextResponse.json({ 
      bookings: allBookings,
      budget: totalBudget,
      spent: totalSpent
    })
  } catch (error) {
    console.error('Error fetching booking data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
