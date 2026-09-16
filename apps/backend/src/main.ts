import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const publicCandidates = [
    join(process.cwd(), 'public'),
    join(__dirname, '..', 'public'),
    join(__dirname, '..', '..', 'public'),
  ];
  const publicDir = publicCandidates.find((dir) => existsSync(dir)) || publicCandidates[0];
  
  // Serve static files from public directory
  app.useStaticAssets(publicDir, {
    prefix: '/public/',
  });
  
  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });
  
  // Reflecting every origin (origin: true) combined with credentials: true lets
  // any website make credentialed requests against this API. Lock it to the
  // configured frontend origin(s) instead; fall back to permissive only when
  // FRONTEND_URL isn't set (local dev without a .env).
  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 43118;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Backend is running on: http://localhost:${port}/api`);
  console.log(`📁 Static files available at: http://localhost:${port}/public/`);
  console.log(`📂 Static assets path resolved to: ${publicDir}`);
}

bootstrap();
