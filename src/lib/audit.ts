import { prisma } from './db'
import { AuthUser } from './auth'

export interface AuditDetails {
  request?: any
  response?: any
  error?: string
  metadata?: Record<string, any>
}

export async function logAudit(
  user: AuthUser | null,
  action: string,
  details: AuditDetails,
  request?: Request
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.userId || null,
        action,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          userAgent: request?.headers.get('user-agent') || null,
        },
        ipAddress: request?.headers.get('x-forwarded-for') || 
                   request?.headers.get('x-real-ip') || 
                   'unknown',
      }
    })
  } catch (error) {
    console.error('Failed to log audit:', error)
    // Don't throw - audit logging should not break the main flow
  }
}
