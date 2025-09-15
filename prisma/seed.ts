import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create terminology entries
  const namasteTerminology = [
    {
      code: 'NAMC0123',
      system: 'namaste',
      display: 'Kasa',
      version: '1.0',
      status: 'active'
    },
    {
      code: 'NAMC0456',
      system: 'namaste',
      display: 'Jwara',
      version: '1.0',
      status: 'active'
    },
    {
      code: 'NAMC0789',
      system: 'namaste',
      display: 'Shiroroga',
      version: '1.0',
      status: 'active'
    }
  ]

  const icd11Terminology = [
    {
      code: 'SK01.2',
      system: 'icd11',
      display: 'Cough',
      version: '2023',
      status: 'active'
    },
    {
      code: 'AB00',
      system: 'icd11',
      display: 'Fever',
      version: '2023',
      status: 'active'
    },
    {
      code: 'AB01',
      system: 'icd11',
      display: 'Headache',
      version: '2023',
      status: 'active'
    }
  ]

  // Insert terminology
  for (const term of [...namasteTerminology, ...icd11Terminology]) {
    await prisma.terminology.upsert({
      where: { code: term.code },
      update: term,
      create: term
    })
  }

  console.log('✅ Terminology entries created')

  // Create mappings
  const mappings = [
    {
      sourceCode: 'NAMC0123',
      sourceSystem: 'NAMASTE',
      targetCode: 'SK01.2',
      targetSystem: 'ICD-11',
      confidence: 1.0,
      relation: 'equivalent',
      status: 'active'
    },
    {
      sourceCode: 'NAMC0456',
      sourceSystem: 'NAMASTE',
      targetCode: 'AB00',
      targetSystem: 'ICD-11',
      confidence: 0.95,
      relation: 'equivalent',
      status: 'active'
    },
    {
      sourceCode: 'NAMC0789',
      sourceSystem: 'NAMASTE',
      targetCode: 'AB01',
      targetSystem: 'ICD-11',
      confidence: 0.9,
      relation: 'equivalent',
      status: 'active'
    },
    // Reverse mappings
    {
      sourceCode: 'SK01.2',
      sourceSystem: 'icd11',
      targetCode: 'NAMC0123',
      targetSystem: 'NAMASTE',
      confidence: 1.0,
      relation: 'equivalent',
      status: 'active'
    },
    {
      sourceCode: 'AB00',
      sourceSystem: 'ICD-11',
      targetCode: 'NAMC0456',
      targetSystem: 'namaste',
      confidence: 0.95,
      relation: 'equivalent',
      status: 'active'
    },
    {
      sourceCode: 'AB01',
      sourceSystem: 'icd11',
      targetCode: 'NAMC0789',
      targetSystem: 'namaste',
      confidence: 0.9,
      relation: 'equivalent',
      status: 'active'
    }
  ]

  // Insert mappings
  for (const mapping of mappings) {
    await prisma.mapping.upsert({
      where: {
        sourceCode_sourceSystem_targetCode_targetSystem: {
          sourceCode: mapping.sourceCode,
          sourceSystem: mapping.sourceSystem,
          targetCode: mapping.targetCode,
          targetSystem: mapping.targetSystem
        }
      },
      update: mapping,
      create: mapping
    })
  }

  console.log('✅ Mappings created')

  // Create some sample audit logs
  const auditLogs = [
    {
      userId: 'mock-user-123',
      action: 'translate',
      details: {
        request: { code: 'NAMC0123', system: 'namaste' },
        response: { mappings: 1 },
        timestamp: new Date().toISOString()
      },
      ipAddress: '127.0.0.1'
    },
    {
      userId: 'mock-user-123',
      action: 'search',
      details: {
        request: { term: 'kasa', system: 'namaste' },
        response: { resultCount: 1 },
        timestamp: new Date().toISOString()
      },
      ipAddress: '127.0.0.1'
    }
  ]

  for (const log of auditLogs) {
    await prisma.auditLog.create({
      data: log
    })
  }

  console.log('✅ Sample audit logs created')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
