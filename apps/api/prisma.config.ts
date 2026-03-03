import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const targetEnv = process.env.APP_ENV === 'prod' ? 'prod' : 'dev';
const databaseUrl =
  process.env.DATABASE_URL ??
  (targetEnv === 'prod'
    ? process.env.DATABASE_URL_PROD
    : process.env.DATABASE_URL_DEV);

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required (or DATABASE_URL_DEV / DATABASE_URL_PROD based on APP_ENV)',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrate: {
    migrations: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
