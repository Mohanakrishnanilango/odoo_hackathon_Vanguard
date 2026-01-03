import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const category = searchParams.get('category')
    const minCost = searchParams.get('minCost')
    const maxCost = searchParams.get('maxCost')
    const maxDuration = searchParams.get('maxDuration')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (cityId) {
      where.cityId = cityId
    }

    if (category) {
      where.category = category
    }

    if (minCost || maxCost) {
      where.cost = {}
      if (minCost) where.cost.gte = parseFloat(minCost)
      if (maxCost) where.cost.lte = parseFloat(maxCost)
    }

    if (maxDuration) {
      where.duration = { lte: parseInt(maxDuration) }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          city: {
            select: {
              id: true,
              name: true,
              country: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
      }),
      prisma.activity.count({ where }),
    ])

    return NextResponse.json({
      activities,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

