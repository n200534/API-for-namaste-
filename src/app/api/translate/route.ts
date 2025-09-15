import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, validateABHAToken } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const user = validateABHAToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const system = searchParams.get('system')

    if (!code || !system) {
      return NextResponse.json(
        { error: 'Missing required parameters: code and system' },
        { status: 400 }
      )
    }

    // Search for terminology
    const terminology = await prisma.terminology.findFirst({
      where: {
        code: code,
        system: system,
        status: 'active'
      }
    })

    if (!terminology) {
      await logAudit(user, 'translate_not_found', {
        request: { code, system },
        metadata: { found: false }
      }, request)
      
      return NextResponse.json(
        { error: 'Terminology not found' },
        { status: 404 }
      )
    }

    // Find mappings
    const mappings = await prisma.mapping.findMany({
      where: {
        sourceCode: code,
        sourceSystem: system,
        status: 'active'
      },
      orderBy: {
        confidence: 'desc'
      }
    })

    const result = {
      source: {
        code: terminology.code,
        system: terminology.system,
        display: terminology.display
      },
      mappings: mappings.map(mapping => ({
        targetCode: mapping.targetCode,
        targetSystem: mapping.targetSystem,
        confidence: mapping.confidence,
        relation: mapping.relation
      }))
    }

    await logAudit(user, 'translate_success', {
      request: { code, system },
      response: result,
      metadata: { mappingCount: mappings.length }
    }, request)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Translate API error:', error)
    
    const user = validateABHAToken(request)
    await logAudit(user, 'translate_error', {
      request: { code: request.nextUrl.searchParams.get('code'), system: request.nextUrl.searchParams.get('system') },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, request)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
