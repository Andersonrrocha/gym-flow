import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const targetEnv = process.env.APP_ENV === 'prod' ? 'prod' : 'dev';
const databaseUrl =
  process.env.DATABASE_URL ??
  (targetEnv === 'prod'
    ? process.env.DATABASE_URL_PROD
    : process.env.DATABASE_URL_DEV);

if (!databaseUrl) {
  console.error(
    'db:sanity: set DATABASE_URL (or DATABASE_URL_DEV / DATABASE_URL_PROD).',
  );
  process.exit(1);
}

const MIN_SYSTEM_EXERCISES = 10;

async function main(): Promise<void> {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$queryRaw`SELECT 1`;
    const count = await prisma.exercise.count({ where: { isSystem: true } });
    if (count < MIN_SYSTEM_EXERCISES) {
      console.error(
        `db:sanity: need at least ${MIN_SYSTEM_EXERCISES} system exercises; found ${count}. Run pnpm db:seed.`,
      );
      process.exit(1);
    }
    console.log(`db:sanity: OK (${count} system exercises).`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
