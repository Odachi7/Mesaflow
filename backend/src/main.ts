import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration - allow multi-origin and x-tenant-id header
  const frontendUrls = process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'];
  app.enableCors({
    origin: frontendUrls.length === 1 ? frontendUrls[0] : frontendUrls,
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-tenant-id',
      'X-Tenant-ID',
    ],
    exposedHeaders: ['x-tenant-id', 'X-Tenant-ID'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('MesaFlow API')
    .setDescription('Sistema Multi-Tenant para Gestão de Restaurantes')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'X-Tenant-ID', in: 'header' },
      'X-Tenant-ID',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 MesaFlow API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
}

bootstrap();