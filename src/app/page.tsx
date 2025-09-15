import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black mb-4">
            NAMASTE Healthcare API
          </h1>
          <p className="text-xl text-black mb-8">
            Dual coding system for AYUSH and ICD-11 integration
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/translate"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Translate Codes
            </Link>
            <Link
              href="/bundle"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Upload Bundle
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 text-black">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-blue-600 text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Search & Translate</h3>
            <p className="text-black">
              Search NAMASTE codes and get corresponding ICD-11 mappings with confidence scores.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-green-600 text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">FHIR Bundle Upload</h3>
            <p className="text-black">
              Upload FHIR bundles with dual-coded conditions to the HAPI FHIR server.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-purple-600 text-3xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2">ABHA Authentication</h3>
            <p className="text-black">
              Secure API access with ABHA token validation and comprehensive audit logging.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">API Endpoints</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono">GET</span>
              <code className="text-black">/api/translate?code=NAMC123&system=namaste</code>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-mono">POST</span>
              <code className="text-black">/api/bundle</code>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono">GET</span>
              <code className="text-black">/api/search?term=kasa&system=namaste</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}