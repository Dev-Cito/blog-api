import {
  Controller, Post, Get, Body,
  UseGuards, Request, HttpCode, Res, UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response, Request as ExpressRequest } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const ACCESS_TTL_MS  = 15 * 60 * 1000;          // 15 minutes
const ACCESS_TTL_SEC = 15 * 60;                  // for Redis blacklist TTL
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenBlacklistService: TokenBlacklistService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(dto.email, dto.password, dto.name);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Registered successfully' };
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Login' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto.email, dto.password);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Logged in successfully' };
  }

  @Post('refresh')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  async refresh(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    const tokens = await this.authService.refresh(refreshToken);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Tokens refreshed' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout' })
  async logout(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { jti } = req.user as { jti: string };
    const refreshToken = req.cookies?.refreshToken;

    await Promise.all([
      jti ? this.tokenBlacklistService.blacklist(jti, ACCESS_TTL_SEC) : Promise.resolve(),
      refreshToken ? this.refreshTokenService.revokeOne(refreshToken) : Promise.resolve(),
    ]);

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOpts = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict',
      path: '/',
    };
    res.clearCookie('accessToken', cookieOpts);
    res.clearCookie('refreshToken', cookieOpts);

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user' })
  getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const base = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict',
      path: '/',
    };
    res.cookie('accessToken', accessToken, { ...base, maxAge: ACCESS_TTL_MS });
    res.cookie('refreshToken', refreshToken, { ...base, maxAge: REFRESH_TTL_MS });
  }
}
