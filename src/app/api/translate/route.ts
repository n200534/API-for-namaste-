import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateABHAToken } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const user = validateABHAToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const codeOrName = searchParams.get('code')
    const system = searchParams.get('system')

    if (!codeOrName || !system) {
      return NextResponse.json(
        { error: 'Missing required parameters: code (or name) and system' },
        { status: 400 }
      )
    }

    const searchValue = codeOrName.toLowerCase()

    const terminologyList = await prisma.terminology.findMany({
      where: {
        system,
        status: 'active',
        OR: [
          { code: codeOrName },
          { display: { contains: searchValue } }
        ]
      },
      take: 10
    })

    if (terminologyList.length === 0) {
      await logAudit(
        user,
        'translate_not_found',
        {
          request: { code: codeOrName, system },
          metadata: { found: false }
        },
        request
      )

      return NextResponse.json(
        { error: 'Terminology not found' },
        { status: 404 }
      )
    }

    const results = await Promise.all(
      terminologyList.map(async (term) => {
        const mappings = await prisma.mapping.findMany({
          where: {
            sourceCode: term.code,
            sourceSystem: system,
            status: 'active'
          },
          orderBy: { confidence: 'desc' }
        })

        // look up display names for target codes
        const enrichedMappings = await Promise.all(
          mappings.map(async (m) => {
            const targetTerm = await prisma.terminology.findFirst({
              where: {
                code: m.targetCode,
                system: m.targetSystem,
                status: 'active'
              }
            })
            return {
              targetCode: m.targetCode,
              targetSystem: m.targetSystem,
              confidence: m.confidence,
              relation: m.relation,
              targetDisplay: targetTerm?.display || null
            }
          })
        )

        return {
          source: {
            code: term.code,
            system: term.system,
            display: term.display
          },
          mappings: enrichedMappings
        }
      })
    )

    await logAudit(
      user,
      'translate_success',
      {
        request: { code: codeOrName, system },
        response: { resultCount: results.length },
        metadata: {
          totalMappings: results.reduce((sum, r) => sum + r.mappings.length, 0)
        }
      },
      request
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Translate API error:', error)

    const user = validateABHAToken(request)
    await logAudit(
      user,
      'translate_error',
      {
        request: {
          code: request.nextUrl.searchParams.get('code'),
          system: request.nextUrl.searchParams.get('system')
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      request
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
