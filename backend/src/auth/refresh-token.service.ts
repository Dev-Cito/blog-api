import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { randomBytes, createHash } from 'crypto';

const REFRESH_TTL_DAYS = 7;

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private repo: Repository<RefreshToken>,
  ) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async create(userId: string): Promise<string> {
    const plainToken = randomBytes(64).toString('hex');
    const tokenHash = this.hash(plainToken);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.repo.save({ tokenHash, userId, expiresAt });
    return plainToken;
  }

  /**
   * Validate and rotate: returns the stored record, then deletes it.
   * The caller must immediately issue a new refresh token.
   */
  async rotate(plainToken: string): Promise<RefreshToken> {
    const tokenHash = this.hash(plainToken);
    const record = await this.repo.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!record) throw new UnauthorizedException('Invalid refresh token');

    await this.repo.delete(record.id);

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return record;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }

  async revokeOne(plainToken: string): Promise<void> {
    const tokenHash = this.hash(plainToken);
    await this.repo.delete({ tokenHash });
  }
}
