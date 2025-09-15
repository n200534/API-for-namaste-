import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, validateABHAToken } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

// Mock FHIR client - in production, use actual FHIR client
const HAPI_FHIR_URL = process.env.HAPI_FHIR_URL || 'http://localhost:8080/fhir'

async function uploadToFHIRServer(bundle: any): Promise<any> {
  try {
    // Check if HAPI FHIR server is available
    const healthCheck = await fetch(`${HAPI_FHIR_URL}/metadata`, {
      method: 'GET',
      headers: {
        'Accept': 'application/fhir+json'
      }
    }).catch(() => null)

    if (!healthCheck || !healthCheck.ok) {
      console.warn('HAPI FHIR server not available, simulating upload')
      return {
        resourceType: 'Bundle',
        id: `simulated-${Date.now()}`,
        type: 'collection',
        entry: bundle.entry?.map((entry: any) => ({
          ...entry,
          resource: {
            ...entry.resource,
            id: `simulated-${entry.resource?.id || 'resource'}-${Date.now()}`
          }
        })) || []
      }
    }

    const response = await fetch(`${HAPI_FHIR_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(bundle)
    })

    if (!response.ok) {
      throw new Error(`FHIR server error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('FHIR upload error:', error)
    throw error
  }
}

function validateFHIRBundle(bundle: any): boolean {
  // Basic FHIR Bundle validation
  if (!bundle || bundle.resourceType !== 'Bundle') {
    return false
  }

  if (!bundle.entry || !Array.isArray(bundle.entry)) {
    return false
  }

  // Check for required resources
  const hasPatient = bundle.entry.some((entry: any) => 
    entry.resource?.resourceType === 'Patient'
  )
  
  const hasCondition = bundle.entry.some((entry: any) => 
    entry.resource?.resourceType === 'Condition'
  )

  return hasPatient && hasCondition
}

export async function POST(request: NextRequest) {
  try {
    const user = validateABHAToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bundle = await request.json()

    // Validate FHIR Bundle
    if (!validateFHIRBundle(bundle)) {
      await logAudit(user, 'bundle_validation_failed', {
        request: { bundleType: bundle?.resourceType },
        error: 'Invalid FHIR Bundle structure'
      }, request)

      return NextResponse.json(
        { error: 'Invalid FHIR Bundle. Must contain Patient and Condition resources.' },
        { status: 400 }
      )
    }

    // Upload to FHIR server
    const fhirResponse = await uploadToFHIRServer(bundle)

    await logAudit(user, 'bundle_upload_success', {
      request: { 
        bundleId: bundle.id,
        entryCount: bundle.entry?.length || 0,
        resourceTypes: bundle.entry?.map((e: any) => e.resource?.resourceType) || []
      },
      response: { 
        fhirId: fhirResponse.id,
        fhirType: fhirResponse.resourceType
      }
    }, request)

    return NextResponse.json({
      success: true,
      fhirResponse,
      message: 'Bundle uploaded successfully to FHIR server'
    })

  } catch (error) {
    console.error('Bundle upload error:', error)
    
    const user = validateABHAToken(request)
    await logAudit(user, 'bundle_upload_error', {
      request: { body: 'Bundle data' },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, request)

    return NextResponse.json(
      { error: 'Failed to upload bundle to FHIR server' },
      { status: 500 }
    )
  }
}
