import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function logStartupEnv() {
  const appEnv = process.env.APP_ENV ?? 'dev';
  const usingDirect = Boolean(process.env.DATABASE_URL);
  const dbSource = usingDirect
    ? 'DATABASE_URL (direct)'
    : `DATABASE_URL_${appEnv.toUpperCase()}`;
  console.log(`[GymFlow] APP_ENV="${appEnv}" | DB source: ${dbSource}`);
}

async function bootstrap() {
  logStartupEnv();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
