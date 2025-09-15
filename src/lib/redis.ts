import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

// Create a mock Redis client if Redis is not available
class MockRedis {
  async get(key: string) { return null }
  async set(key: string, value: string) { return 'OK' }
  async del(key: string) { return 1 }
  async exists(key: string) { return 0 }
  async expire(key: string, seconds: number) { return 1 }
  async ttl(key: string) { return -1 }
  async flushall() { return 'OK' }
  async quit() { return 'OK' }
}

let redis: Redis | MockRedis

try {
  redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis as Redis
} catch (error) {
  console.warn('Redis not available, using mock client:', error)
  redis = new MockRedis()
}

export { redis }
