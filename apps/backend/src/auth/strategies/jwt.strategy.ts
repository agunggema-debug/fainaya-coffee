import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Cookie name for the JWT (HttpOnly, Secure, SameSite - PRD 4.3 Security)
export const COOKIE_TOKEN_NAME = 'faianaya_token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          // 1. Try reading from HttpOnly cookie
          if (req && req.cookies && req.cookies[COOKIE_TOKEN_NAME]) {
            return req.cookies[COOKIE_TOKEN_NAME];
          }
          return null;
        },
        // 2. Try reading from Authorization: Bearer <token>
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'faianaya-secret'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      branchId: payload.branchId,
    };
  }
}