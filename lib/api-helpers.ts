import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }
  return session.user
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}

export function notFoundResponse(message = 'Resource not found') {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  )
}

export function badRequestResponse(message = 'Bad request') {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}

