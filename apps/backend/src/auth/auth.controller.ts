import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Response } from 'express';
import { COOKIE_TOKEN_NAME } from './strategies/jwt.strategy';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login user dengan email dan password' })
  @ApiResponse({ status: 200, description: 'Login berhasil, token JWT dikembalikan dan diset ke HttpOnly Cookie' })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  async login(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(req.user);
    const token = result.access_token ?? '';

    // Set JWT as HttpOnly, Secure (in production), SameSite cookie (PRD 4.3 Security)
    res.cookie(COOKIE_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return result;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiOperation({ summary: 'Registrasi akun (hanya publik/self-service jika diaktifkan)' })
  async register(@Body() dto: any) {
    return this.authService.register(dto);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ambil profil user yang sedang login' })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user dan hapus cookie auth' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_TOKEN_NAME, { path: '/' });
    return { message: 'Logout berhasil' };
  }
}
