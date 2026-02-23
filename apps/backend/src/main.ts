import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  
  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });
  
  app.enableCors({
    origin: true,
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
}

bootstrap();
