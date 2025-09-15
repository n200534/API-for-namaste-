'use client'

import { useState } from 'react'
import Link from 'next/link'

interface UploadResult {
  success: boolean
  fhirResponse?: any
  message?: string
  error?: string
}

export default function BundlePage() {
  const [bundle, setBundle] = useState('')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [loading, setLoading] = useState(false)

  const exampleBundle = {
    "resourceType": "Bundle",
    "id": "example-bundle-123",
    "type": "collection",
    "entry": [
      {
        "resource": {
          "resourceType": "Patient",
          "id": "patient-123",
          "identifier": [
            {
              "system": "https://abdm.gov.in/abha",
              "value": "ABHA1234567890"
            }
          ],
          "name": [
            {
              "family": "Doe",
              "given": ["John"]
            }
          ]
        }
      },
      {
        "resource": {
          "resourceType": "Condition",
          "id": "condition-123",
          "subject": {
            "reference": "Patient/patient-123"
          },
          "code": {
            "coding": [
              {
                "system": "http://namaste.ayush.gov.in/namc",
                "code": "NAMC0123",
                "display": "Kasa"
              },
              {
                "system": "http://id.who.int/icd/release/11/mms",
                "code": "SK01.2",
                "display": "Cough"
              }
            ],
            "text": "Kasa (Cough)"
          }
        }
      }
    ]
  }

  const handleUpload = async () => {
    if (!bundle.trim()) {
      setResult({ success: false, error: 'Please enter a FHIR Bundle' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const bundleData = JSON.parse(bundle)
      
      const response = await fetch('/api/bundle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-valid-token'
        },
        body: JSON.stringify(bundleData)
      })

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Invalid JSON format'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    setBundle(JSON.stringify(exampleBundle, null, 2))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 text-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">
              FHIR Bundle Upload
            </h1>
            <p className="text-lg text-black ">
              Upload FHIR bundles with dual-coded conditions to the HAPI FHIR server
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Upload Bundle</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-black  mb-2">
                  FHIR Bundle JSON
                </label>
                <textarea
                  value={bundle}
                  onChange={(e) => setBundle(e.target.value)}
                  placeholder="Paste your FHIR Bundle JSON here..."
                  rows={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  {loading ? 'Uploading...' : 'Upload Bundle'}
                </button>
                <button
                  onClick={loadExample}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  Load Example
                </button>
              </div>

              {result && (
                <div className={`mt-6 p-4 rounded-lg ${
                  result.success 
                    ? 'bg-green-100 border border-green-400 text-green-700'
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  <h3 className="font-semibold mb-2">
                    {result.success ? 'Upload Successful!' : 'Upload Failed'}
                  </h3>
                  <p className="text-sm">
                    {result.message || result.error}
                  </p>
                  {result.fhirResponse && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        View FHIR Response
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(result.fhirResponse, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Bundle Requirements</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-medium text-black ">Patient Resource</h3>
                    <p className="text-sm text-black ">Must include a Patient resource with ABHA identifier</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-medium text-black ">Condition Resource</h3>
                    <p className="text-sm text-black ">Must include a Condition resource with dual coding</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-medium text-black ">Dual Coding</h3>
                    <p className="text-sm text-black ">Condition must have both NAMASTE and ICD-11 codes</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-medium text-black ">Valid JSON</h3>
                    <p className="text-sm text-black ">Bundle must be valid FHIR R4 JSON format</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-medium text-black  mb-3">Example Structure</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs text-black  overflow-auto">
{`{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "identifier": [
          {
            "system": "https://abdm.gov.in/abha",
            "value": "ABHA1234567890"
          }
        ]
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "code": {
          "coding": [
            {
              "system": "http://namaste.ayush.gov.in/namc",
              "code": "NAMC0123",
              "display": "Kasa"
            },
            {
              "system": "http://id.who.int/icd/release/11/mms",
              "code": "SK01.2",
              "display": "Cough"
            }
          ]
        }
      }
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
