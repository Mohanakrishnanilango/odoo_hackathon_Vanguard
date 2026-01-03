import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-helpers'

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
            activities: true,
          },
        },
        expenses: true,
      },
    })

    if (!trip || trip.userId !== user.id) {
      return unauthorizedResponse()
    }

    // Calculate budget breakdown
    const activities = trip.stops.flatMap(stop => stop.activities)
    const activityCost = activities.reduce((sum, act) => sum + act.cost, 0)

    const expensesByCategory = trip.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    const totalExpenses = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalEstimated = activityCost + totalExpenses

    const days = Math.ceil(
      (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const costPerDay = days > 0 ? totalEstimated / days : 0

    const breakdown = {
      transport: expensesByCategory['TRANSPORT'] || 0,
      accommodation: expensesByCategory['ACCOMMODATION'] || 0,
      activities: activityCost + (expensesByCategory['ACTIVITY'] || 0),
      meals: expensesByCategory['MEAL'] || 0,
      other: expensesByCategory['OTHER'] || 0,
    }

    return NextResponse.json({
      budget: {
        totalBudget: trip.budget,
        totalEstimated,
        totalExpenses,
        costPerDay,
        days,
        breakdown,
        overBudget: totalEstimated > trip.budget,
        remaining: trip.budget - totalEstimated,
      },
    })
  } catch (error) {
    console.error('Error calculating budget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

