import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, expenseId: string } }
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

    const expense = await prisma.expense.findFirst({
      where: {
        id: params.expenseId,
        tripId: params.id,
      },
    })

    if (!expense) {
      return notFoundResponse()
    }

    await prisma.expense.delete({
      where: { id: params.expenseId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
