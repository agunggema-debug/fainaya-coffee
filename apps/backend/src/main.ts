import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const corsOriginsFromEnv = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Helmet HTTP security headers (OWASP / NestJS Security Guide)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Swagger UI & dynamic local assets
    }),
  );

  // Local & Private Network validator for CORS
  const isAllowedOrigin = (origin: string): boolean => {
    if (corsOriginsFromEnv.includes(origin)) return true;
    try {
      const parsed = new URL(origin);
      const hostname = parsed.hostname;
      return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
      );
    } catch {
      return false;
    }
  };

  // CORS configuration for local & network access
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // Cookie parser middleware (HttpOnly auth cookies)
  app.use(cookieParser());

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Input validation & sanitation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Faianaya Coffee API')
    .setDescription('Sistem Manajemen Kedai Kopi Terpadu - Open Source')
    .setVersion('1.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3001);
  // Listen on '0.0.0.0' for local and LAN accessibility (POS/KDS tablets)
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Faianaya Coffee Backend running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();