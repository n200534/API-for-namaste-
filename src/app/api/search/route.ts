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
    const term = searchParams.get('term')
    const system = searchParams.get('system')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!term) {
      return NextResponse.json(
        { error: 'Missing required parameter: term' },
        { status: 400 }
      )
    }

    // Search terminology - using SQLite compatible syntax
    const whereClause: any = {
      status: 'active',
      OR: [
        { code: { contains: term } },
        { display: { contains: term } }
      ]
    }

    if (system) {
      whereClause.system = system
    }

    const results = await prisma.terminology.findMany({
      where: whereClause,
      take: limit,
      orderBy: [
        { code: 'asc' },
        { display: 'asc' }
      ]
    })

    // If searching in a specific system, also find mappings
    let mappings: any[] = []
    if (system) {
      mappings = await prisma.mapping.findMany({
        where: {
          sourceSystem: system,
          status: 'active',
          OR: [
            { sourceCode: { contains: term } },
            { targetCode: { contains: term } }
          ]
        },
        take: limit,
        orderBy: {
          confidence: 'desc'
        }
      })
    }

    const response = {
      query: { term, system, limit },
      results: results.map(item => ({
        code: item.code,
        system: item.system,
        display: item.display,
        version: item.version
      })),
      mappings: mappings.map(mapping => ({
        sourceCode: mapping.sourceCode,
        sourceSystem: mapping.sourceSystem,
        targetCode: mapping.targetCode,
        targetSystem: mapping.targetSystem,
        confidence: mapping.confidence,
        relation: mapping.relation
      }))
    }

    await logAudit(user, 'search_success', {
      request: { term, system, limit },
      response: { 
        resultCount: results.length,
        mappingCount: mappings.length
      }
    }, request)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Search API error:', error)
    
    const user = validateABHAToken(request)
    await logAudit(user, 'search_error', {
      request: { 
        term: request.nextUrl.searchParams.get('term'),
        system: request.nextUrl.searchParams.get('system')
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, request)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
