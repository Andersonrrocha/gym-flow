/**
 * Popula exercícios de sistema (isSystem=true) com IDs estáveis.
 * Idempotente: pode ser executado várias vezes (upsert por id).
 *
 * Requer DATABASE_URL ou DATABASE_URL_DEV (e opcionalmente APP_ENV), como no prisma.config.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const targetEnv = process.env.APP_ENV === "prod" ? "prod" : "dev";
const databaseUrl =
  process.env.DATABASE_URL ??
  (targetEnv === "prod"
    ? process.env.DATABASE_URL_PROD
    : process.env.DATABASE_URL_DEV);

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required (or DATABASE_URL_DEV / DATABASE_URL_PROD based on APP_ENV)",
  );
}

/**
 * Stable IDs for system exercises (aligned with app catalog keys).
 * catalogKey = chave em messages (en/pt), namespace Exercises.catalog (next-intl).
 */
const SYSTEM_EXERCISES = [
  {
    id: "ex-1",
    catalogKey: "bench_press",
    name: "Bench Press",
    muscleGroup: "chest",
    equipment: "barbell",
  },
  {
    id: "ex-2",
    catalogKey: "barbell_squat",
    name: "Barbell Squat",
    muscleGroup: "legs",
    equipment: "barbell",
  },
  {
    id: "ex-3",
    catalogKey: "barbell_row",
    name: "Barbell Row",
    muscleGroup: "back",
    equipment: "barbell",
  },
  {
    id: "ex-4",
    catalogKey: "overhead_press",
    name: "Overhead Press",
    muscleGroup: "shoulders",
    equipment: "barbell",
  },
  {
    id: "ex-5",
    catalogKey: "dumbbell_curl",
    name: "Dumbbell Curl",
    muscleGroup: "biceps",
    equipment: "dumbbell",
  },
  {
    id: "ex-6",
    catalogKey: "tricep_pushdown",
    name: "Tricep Pushdown",
    muscleGroup: "triceps",
    equipment: "cable",
  },
  {
    id: "ex-7",
    catalogKey: "lat_pulldown",
    name: "Lat Pulldown",
    muscleGroup: "back",
    equipment: "cable",
  },
  {
    id: "ex-8",
    catalogKey: "leg_press",
    name: "Leg Press",
    muscleGroup: "legs",
    equipment: "machine",
  },
  {
    id: "ex-9",
    catalogKey: "lateral_raise",
    name: "Lateral Raise",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
  },
  {
    id: "ex-10",
    catalogKey: "plank",
    name: "Plank",
    muscleGroup: "core",
    equipment: "bodyweight",
  },
] as const;

async function main() {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    for (const row of SYSTEM_EXERCISES) {
      await prisma.exercise.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          catalogKey: row.catalogKey,
          name: row.name,
          muscleGroup: row.muscleGroup,
          equipment: row.equipment,
          isSystem: true,
          createdByUserId: null,
        },
        update: {
          catalogKey: row.catalogKey,
          name: row.name,
          muscleGroup: row.muscleGroup,
          equipment: row.equipment,
          isSystem: true,
          createdByUserId: null,
        },
      });
    }
    console.log(`Seeded ${SYSTEM_EXERCISES.length} system exercises.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
