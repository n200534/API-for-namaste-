import { NextRequest } from 'next/server'

export interface AuthUser {
  userId: string
  abhaId?: string
  role?: string
}

export function validateABHAToken(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  // Mock validation - in production, this would validate against ABDM
  if (token === process.env.ABHA_MOCK_TOKEN || token === 'mock-valid-token') {
    return {
      userId: 'mock-user-123',
      abhaId: 'ABHA1234567890',
      role: 'doctor'
    }
  }

  return null
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = validateABHAToken(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
