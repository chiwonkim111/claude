/**
 * Redis 캐시 클라이언트
 * - 마켓 밸류 계산 결과 캐싱, 세션 데이터 임시 저장
 */
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisClient implements OnModuleDestroy {
  private readonly client: Redis
  private readonly logger = new Logger(RedisClient.name)

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    })

    this.client.on('error', (err) => {
      this.logger.error('Redis 연결 오류', err)
    })
  }

  /**
   * 키-값 저장 (TTL 초 단위)
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value)
    } else {
      await this.client.set(key, value)
    }
  }

  /**
   * 키로 값 조회
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  /**
   * 키 삭제 (캐시 무효화)
   */
  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  /**
   * 객체를 JSON 직렬화하여 저장
   */
  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds)
  }

  /**
   * JSON 역직렬화하여 객체로 반환
   */
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      this.logger.warn(`Redis JSON 파싱 실패: ${key}`)
      return null
    }
  }

  /** 모듈 종료 시 Redis 연결 해제 */
  async onModuleDestroy(): Promise<void> {
    await this.client.quit()
  }
}
