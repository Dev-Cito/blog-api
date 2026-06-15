import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class TokenBlacklistService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Add a jti to the blacklist.
   * ttlSeconds should match the token's remaining lifetime so Redis
   * auto-cleans the entry when the token would have expired anyway.
   */
  async blacklist(jti: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(`bl:${jti}`, '1', 'EX', ttlSeconds);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redis.get(`bl:${jti}`);
    return result !== null;
  }
}
