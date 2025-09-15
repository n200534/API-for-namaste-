'use client'

import { useState } from 'react'
import Link from 'next/link'

interface TranslationResult {
  source: {
    code: string
    system: string
    display: string
  }
  mappings: Array<{
    targetCode: string
    targetSystem: string
    confidence: number
    relation?: string
  }>
}

export default function TranslatePage() {
  const [code, setCode] = useState('')
  const [system, setSystem] = useState('namaste')
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTranslate = async () => {
    if (!code.trim()) {
      setError('Please enter a code')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/translate?code=${encodeURIComponent(code)}&system=${encodeURIComponent(system)}`, {
        headers: {
          'Authorization': 'Bearer mock-valid-token'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Translation failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">
              Code Translation
            </h1>
            <p className="text-lg text-black">
              Translate NAMASTE codes to ICD-11 and vice versa
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g., NAMC0123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  System
                </label>
                <select
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="namaste">NAMASTE</option>
                  <option value="icd11">ICD-11</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleTranslate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                {loading ? 'Translating...' : 'Translate'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-black rounded-lg">
                {error}
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-black">Translation Result</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-black mb-2">Source</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-black">Code:</span>
                      <p className="font-mono text-lg text-black">{result.source.code}</p>
                    </div>
                    <div>
                      <span className="text-sm text-black">System:</span>
                      <p className="font-mono text-lg text-black">{result.source.system}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-black">Display:</span>
                      <p className="text-lg text-black">{result.source.display}</p>
                    </div>
                  </div>
                </div>
              </div>

              {result.mappings.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-black mb-4">Mappings</h3>
                  <div className="space-y-4">
                    {result.mappings.map((mapping, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-black">Target Code:</span>
                            <p className="font-mono text-lg text-black">{mapping.targetCode}</p>
                          </div>
                          <div>
                            <span className="text-sm text-black">Target System:</span>
                            <p className="font-mono text-lg text-black">{mapping.targetSystem}</p>
                          </div>
                          <div>
                            <span className="text-sm text-black">Confidence:</span>
                            <p className="text-lg">
                              <span className={`px-2 py-1 rounded text-sm ${
                                mapping.confidence >= 0.8 ? 'bg-green-100 text-black' :
                                mapping.confidence >= 0.6 ? 'bg-yellow-100 text-black' :
                                'bg-red-100 text-black'
                              }`}>
                                {(mapping.confidence * 100).toFixed(1)}%
                              </span>
                            </p>
                          </div>
                          {mapping.relation && (
                            <div>
                              <span className="text-sm text-black">Relation:</span>
                              <p className="text-lg text-black">{mapping.relation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-black">
                  No mappings found for this code
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-black font-medium hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
