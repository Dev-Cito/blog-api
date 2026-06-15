import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RefreshTokenService } from './refresh-token.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const exists = await this.usersService.findByEmail(email);
    if (exists) throw new ConflictException('Email already in use');
    const hashed = await bcrypt.hash(password, 12);
    const user = await this.usersService.create({ email, password: hashed, name });
    return this.generateTokens(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.generateTokens(user.id, user.email);
  }

  async refresh(plainRefreshToken: string) {
    const record = await this.refreshTokenService.rotate(plainRefreshToken);
    return this.generateTokens(record.userId, record.user.email);
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    const { password, ...result } = user;
    return result;
  }

  async generateTokens(userId: string, email: string) {
    const jti = randomUUID();
    const payload = { sub: userId, email, jti };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.refreshTokenService.create(userId);
    return { accessToken, refreshToken };
  }
}
