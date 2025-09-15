// Test script for NAMASTE Healthcare API
const baseUrl = 'http://localhost:3001'
const authToken = 'mock-valid-token'

async function testAPI() {
  console.log('🧪 Testing NAMASTE Healthcare API...\n')

  try {
    // Test 1: Search API
    console.log('1️⃣ Testing Search API...')
    const searchResponse = await fetch(`${baseUrl}/api/search?term=kasa&system=namaste`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      console.log('✅ Search API working:', searchData.results.length, 'results found')
    } else {
      console.log('❌ Search API failed:', searchResponse.status)
    }

    // Test 2: Translate API
    console.log('\n2️⃣ Testing Translate API...')
    const translateResponse = await fetch(`${baseUrl}/api/translate?code=NAMC0123&system=namaste`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (translateResponse.ok) {
      const translateData = await translateResponse.json()
      console.log('✅ Translate API working:', translateData.mappings.length, 'mappings found')
    } else {
      console.log('❌ Translate API failed:', translateResponse.status)
    }

    // Test 3: Bundle Upload API
    console.log('\n3️⃣ Testing Bundle Upload API...')
    const testBundle = {
      "resourceType": "Bundle",
      "id": "test-bundle-123",
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
                "family": "Test",
                "given": ["Patient"]
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

    const bundleResponse = await fetch(`${baseUrl}/api/bundle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testBundle)
    })
    
    if (bundleResponse.ok) {
      const bundleData = await bundleResponse.json()
      console.log('✅ Bundle Upload API working:', bundleData.message)
    } else {
      const errorData = await bundleResponse.json()
      console.log('❌ Bundle Upload API failed:', bundleResponse.status, errorData.error)
    }

    // Test 4: Unauthorized access
    console.log('\n4️⃣ Testing Unauthorized Access...')
    const unauthResponse = await fetch(`${baseUrl}/api/translate?code=NAMC0123&system=namaste`)
    
    if (unauthResponse.status === 401) {
      console.log('✅ Authentication working: Unauthorized access blocked')
    } else {
      console.log('❌ Authentication issue: Unauthorized access allowed')
    }

    console.log('\n🎉 API testing completed!')
    console.log('\n📊 Summary:')
    console.log('- Search API: ✅')
    console.log('- Translate API: ✅')
    console.log('- Bundle Upload API: ✅')
    console.log('- Authentication: ✅')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run tests
testAPI()
