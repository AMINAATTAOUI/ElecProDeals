import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedPriceSheets } from './database/seeds/seed-price-sheets';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env['CORS_ORIGINS']?.split(',') ?? [
      'http://localhost:8081', // Expo dev
      'http://localhost:3001', // Next.js admin
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Seed initial (idempotent — ne tourne que si la table est vide)
  const dataSource = app.get(DataSource);
  await seedPriceSheets(dataSource);

  // Health check pour Railway / load balancers
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: unknown, res: { json: (o: object) => void }) =>
    res.json({ status: 'ok' }),
  );

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  console.log(`Backend ElecProDeals démarré sur le port ${port}`);
}

void bootstrap();
